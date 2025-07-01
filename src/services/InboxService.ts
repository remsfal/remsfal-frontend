export interface InboxMessage {
  id: string;
  type: 'Rechnung' | 'Nachricht';
  contractor: string;
  project: string;
  unit: string;
  tenant: string;
  owner: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  receivedAt: Date;
  isRead: boolean;
}

class InboxService {
  generateMockInboxData(): InboxMessage[] {
    return [
      {
        id: '1',
        type: 'Nachricht',
        contractor: 'Bau GmbH',
        project: 'Neubau Musterstraße',
        unit: 'Wohnung 101',
        tenant: 'Max Müller',
        owner: 'Immobilien AG',
        senderName: 'Max Mustermann',
        senderEmail: 'max.mustermann@example.com',
        subject: 'Kücheninstallation abgeschlossen',
        body: 'Die Installation der Küche in Wohnung 101 wurde erfolgreich abgeschlossen. Bitte prüfen Sie die Qualität und melden sich bei Fragen.',
        receivedAt: new Date('2025-06-01T10:15:00'),
        isRead: false,
      },
      {
        id: '2',
        type: 'Rechnung',
        contractor: 'Sanitär AG',
        project: 'Neubau Musterstraße',
        unit: 'Wohnung 102',
        tenant: 'Irene Schmidt',
        owner: 'Immobilien AG',
        senderName: 'Erika Musterfrau',
        senderEmail: 'erika.musterfrau@example.com',
        subject: 'Rechnung für Badezimmerarbeiten Mai 2025',
        body: 'Anbei findest du die aktuelle Rechnung für Mai 2025. Bitte begleiche den offenen Betrag bis zum 15.06.2025.',
        receivedAt: new Date('2025-05-28T14:30:00'),
        isRead: false,
      },
      {
        id: '3',
        type: 'Nachricht',
        contractor: 'Facility Service GmbH',
        project: 'Campus Treskowallee',
        unit: 'Büro A029',
        tenant: 'HTW Berlin',
        owner: 'Campus Management GmbH',
        senderName: 'System-Benachrichtigung',
        senderEmail: 'noreply@remsfal.de',
        subject: 'Wartungsarbeiten geplant',
        body: 'Am 2025-06-10 findet eine Systemwartung von 01:00 bis 03:00 Uhr statt. In dieser Zeit ist das System möglicherweise nicht erreichbar.',
        receivedAt: new Date('2025-05-25T08:00:00'),
        isRead: true,
      },
      {
        id: '4',
        type: 'Nachricht',
        contractor: 'Bau GmbH',
        project: 'Neubau Musterstraße',
        unit: 'Wohnung 202',
        tenant: 'Bernd Beispiel',
        owner: 'Immobilien AG',
        senderName: 'Johannes Beispiel',
        senderEmail: 'johannes.beispiel@example.com',
        subject: 'Frage zum Objekt „Wohnung 202“',
        body: 'Hallo, ich habe eine Frage zu den notwendigen Wartungsarbeiten in der Wohnung 202.',
        receivedAt: new Date('2025-05-20T09:45:00'),
        isRead: false,
      },
      {
        id: '5',
        type: 'Rechnung',
        contractor: 'Elektro AG',
        project: 'Campus Treskowallee',
        unit: 'Raum A002',
        tenant: 'HTW Berlin',
        owner: 'Campus Management GmbH',
        senderName: 'Maria Beispiel',
        senderEmail: 'maria.beispiel@example.com',
        subject: 'Rechnung für Elektroarbeiten April 2025',
        body: 'Die Rechnung für die Elektroarbeiten im April 2025 findest du im Anhang. Bitte begleiche sie bis zum 15.06.2025.',
        receivedAt: new Date('2025-05-18T11:20:00'),
        isRead: false,
      },
      {
        id: '6',
        type: 'Nachricht',
        contractor: 'Sicherheit GmbH',
        project: 'Campus Treskowallee',
        unit: 'Raum A008',
        tenant: 'HTW Berlin',
        owner: 'Campus Management GmbH',
        senderName: 'Sicherheitsdienst',
        senderEmail: 'security@facility.de',
        subject: 'Alarm: Rauchmelder ausgelöst',
        body: 'Im Raum A008 wurde um 22:30 Uhr der Rauchmelder ausgelöst. Bitte prüfen.',
        receivedAt: new Date('2025-05-15T22:31:00'),
        isRead: true,
      },
      {
        id: '7',
        type: 'Nachricht',
        contractor: 'Facility Service GmbH',
        project: 'Neubau Musterstraße',
        unit: 'Wohnung 101',
        tenant: 'Max Müller',
        owner: 'Immobilien AG',
        senderName: 'Lisa Beispiel',
        senderEmail: 'lisa.beispiel@example.com',
        subject: 'Meeting Protokoll',
        body: 'Das Protokoll des Meetings vom 10.05.2025 bezüglich der Wohnung 101 findest du im Anhang.',
        receivedAt: new Date('2025-05-12T16:00:00'),
        isRead: false,
      },
    ];
  }

  async fetchInboxData(): Promise<InboxMessage[]> {
    // Hier könnte ein API-Call stattfinden
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.generateMockInboxData());
      }, 500);
    });
  }
}

export const inboxService: InboxService = new InboxService();
