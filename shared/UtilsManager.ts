import { Logger } from './Logger';
import { PerformanceNow } from './PerformanceNow';
import { UuidGenerator } from './UuidGenerator';

export class UtilsManager {
    constructor(
        public uuid: UuidGenerator,
        public performanceNow: PerformanceNow,
        public logger: Logger,
    ) {}
}
