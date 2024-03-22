import { TextSkeleton } from '@components/text-skeleton/text-skeleton';
import { BaseComponent } from '@control.ts/signals';
import { TimerService } from '@services/timer.service';
import { formatTime } from '@utils/fomatTime';

import styles from './timer.module.scss';

class TimerComponent extends BaseComponent {
  private readonly timerService = new TimerService(1000);

  constructor(private premiereDate: number) {
    super(
      {
        className: styles.timer,
      },
      TextSkeleton(),
    );
    this.timerService.subscribe(this);
  }

  public update(currentTime: number): void {
    if (this.premiereDate <= currentTime) {
      this.setTextContent('The premiere has started');
      this.timerService.stop();
    } else {
      const timeResult = formatTime(this.premiereDate - currentTime);
      this.setTextContent(timeResult);
    }
  }

  public override destroy(): void {
    this.timerService.stop();
    super.destroy();
  }
}

export const Timer = (premiereDate: number) => new TimerComponent(premiereDate);
