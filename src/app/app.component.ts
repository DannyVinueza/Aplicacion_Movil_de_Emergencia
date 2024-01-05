import { Component } from '@angular/core';
import { NotificationService } from './services/notification-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private newEmergencySubscription: Subscription = undefined!;

  constructor(private notificationService: NotificationService) {
    this.listenForNewEmergencies();
  }

  private listenForNewEmergencies() {
    this.newEmergencySubscription = this.notificationService.onNewEmergency().subscribe(async (emergencyId: string) => {
      await this.notificationService.showNewEmergencyAlert(emergencyId);
    });
  }
}
