import { ref } from 'vue';
import { useEventBus } from '@/stores/EventStore';
import { useUserSessionStore } from '@/stores/UserSession';

type IssueEventJson = {
    eventId?: string;
    createdAt?: number;
    audience?: 'PROJECT_ALL' | 'TENANCY_ALL' | 'USER_ONLY';
    issueEventType?: 'ISSUE_CREATED' | 'ISSUE_UPDATED' | 'ISSUE_ASSIGNED' | 'ISSUE_MENTIONED';
    issueId?: string;
    projectId?: string;
    tenancyId?: string;
    title?: string;
    link?: string;
    project?: { id?: string; title?: string };
    owner?: { firstName?: string; lastName?: string; email?: string };
    mentionedUser?: { firstName?: string; lastName?: string; email?: string };
    user?: { firstName?: string; lastName?: string; email?: string; name?: string };
};

function fullName(u?: { firstName?: string; lastName?: string; email?: string; name?: string }) {
    if (!u) return '';
    const n = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return n || u.name || u.email || '';
}

function eventToToast(ev: IssueEventJson) {
    const type = ev.issueEventType ?? 'ISSUE_UPDATED';

    const project = ev.project?.title ? ` • ${ev.project.title}` : '';
    const issueTitle = ev.title ? `: ${ev.title}` : '';
    const actor = fullName(ev.user);
    const actorPart = actor ? ` von ${actor}` : '';

    let severity: 'success' | 'info' | 'warn' = 'info';
    let summary = 'Ticket';
    let detail = '';

    switch (type) {
        case 'ISSUE_CREATED':
            severity = 'success';
            summary = 'Neues Ticket';
            detail = `Ticket erstellt${project}${issueTitle}${actorPart}`;
            break;
        case 'ISSUE_UPDATED':
            severity = 'info';
            summary = 'Ticket aktualisiert';
            detail = `Ticket aktualisiert${project}${issueTitle}${actorPart}`;
            break;
        case 'ISSUE_ASSIGNED': {
            severity = 'warn';
            summary = 'Ticket zugewiesen';
            const owner = fullName(ev.owner);
            const ownerPart = owner ? ` → ${owner}` : '';
            detail = `Ticket zugewiesen${project}${issueTitle}${ownerPart}${actorPart}`;
            break;
        }
        case 'ISSUE_MENTIONED': {
            severity = 'info';
            summary = 'Erwähnung im Ticket';
            const mentioned = fullName(ev.mentionedUser);
            const mentionedPart = mentioned ? ` (Erwähnt: ${mentioned})` : '';
            detail = `Erwähnung${project}${issueTitle}${mentionedPart}${actorPart}`;
            break;
        }
    }

    return {
 severity, summary, detail, link: ev.link 
};
}

export function useIssueNotificationsSse() {
    const bus = useEventBus();
    const sessionStore = useUserSessionStore();

    const connected = ref(false);
    const lastError = ref<any>(null);

    let es: EventSource | null = null;
    let retryTimer: number | null = null;
    let retryMs = 1000;

    const SSE_URL = '/notification/stream';

    function isLoggedInBestEffort() {
        // Wir kennen dein Store-Interface nicht exakt → best-effort checks
        // Wenn du einen klaren Flag hast (z.B. sessionStore.isAuthenticated), greift er automatisch.
        // Falls nicht, ist es auch okay: wir versuchen einfach zu verbinden.

        const s = sessionStore as unknown as {
            isAuthenticated?: boolean;
            user?: unknown;
        };

        if (typeof s.isAuthenticated === 'boolean') return s.isAuthenticated;
        if (s.user) return true;

        return true; // fallback: try anyway
    }


    function scheduleRetry() {
        if (retryTimer != null) return;
        retryTimer = window.setTimeout(() => {
            retryTimer = null;
            retryMs = Math.min(retryMs * 1.5, 15000);
            connect();
        }, retryMs);
    }

    function connect() {
        if (es) return;
        if (!isLoggedInBestEffort()) {
            scheduleRetry();
            return;
        }

        try {
            es = new EventSource(SSE_URL, { withCredentials: true });

            es.addEventListener('connected', () => {
                connected.value = true;
                lastError.value = null;
                retryMs = 1000;

                bus.emit('toast:show', {
                    severity: 'info',
                    summary: 'Benachrichtigungen',
                    detail: 'Live verbunden',
                });
            });

            es.addEventListener('issue', (e: MessageEvent) => {
                try {
                    const ev: IssueEventJson = JSON.parse(e.data);
                    const toast = eventToToast(ev);

                    bus.emit('toast:show', {
                        severity: toast.severity,
                        summary: toast.summary,
                        detail: toast.detail,
                    });

                    // Optional später: click handling / navigation über link
                    // if (toast.link) { ... }
                } catch (err) {
                    console.error('[SSE] Failed to parse issue event', err, e.data);
                }
            });

            es.onerror = (e) => {
                connected.value = false;
                lastError.value = e;

                // Close + retry (robuster als “EventSource macht schon” in Auth/Proxy Setups)
                try {
                    es?.close();
                } catch  {
                    // ignore close errors
                }
                es = null;

                scheduleRetry();
            };

        } catch (err) {
            connected.value = false;
            lastError.value = err;
            es = null;
            scheduleRetry();
        }
    }

    function disconnect() {
        if (retryTimer != null) {
            window.clearTimeout(retryTimer);
            retryTimer = null;
        }

        if (es) {
            try {
                es.close();
            } catch  {
                // ignore close errors
            }
            es = null;
        }

        connected.value = false;
    }


    return {
 connected, lastError, connect, disconnect 
};
}
