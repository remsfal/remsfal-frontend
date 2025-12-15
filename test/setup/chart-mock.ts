// Mock Chart.js to prevent canvas-related crashes during tests
export class Chart {
    constructor() {}
    update() {}
    destroy() {}
}
