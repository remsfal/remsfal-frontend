/**
 * Holds intercepted responses back until `release()` is called.
 *
 * Use it to assert loading states (skeletons, disabled buttons) without relying on a fixed
 * `delay`: on a cold dev server the page may need longer to render than the delay lasts,
 * so the response would arrive before the loading state is ever visible.
 *
 * @example
 * const gate = createResponseGate();
 * cy.intercept('GET', url, (req) => gate.hold(() => req.reply({ statusCode: 200, body }))).as('getData');
 * cy.visit(url);
 * cy.get('.p-skeleton').should('exist').then(gate.release);
 * cy.wait('@getData');
 */
export function createResponseGate() {
  let release!: () => void;
  const opened = new Promise<void>((resolve) => {
    release = resolve;
  });

  return {
    /** Runs the given reply once the gate has been released. */
    hold: (reply: () => void) => opened.then(reply),
    /** Lets all held responses through. */
    release: () => release(),
  };
}
