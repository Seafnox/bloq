import { Logger } from './Logger';
import { PerformanceNow } from './performanceNow';
import { UuidGenerator } from './uuidGenerator';

export class UtilsManager {
    constructor(
        public uuid: UuidGenerator,
        public performanceNow: PerformanceNow,
        public logger: Logger,
    ) {}
}
