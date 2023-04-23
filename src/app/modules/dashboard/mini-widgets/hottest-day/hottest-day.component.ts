import { Component, OnInit } from '@angular/core';
import { ConditionMapPipe } from 'src/app/pipes/conditions.pipe';
import { ApiSummary } from 'src/app/services/api.service';
import { MiniWidgetsService } from 'src/app/services/mini-widgets.service';

@Component({
  selector: 'app-hottest-day',
  templateUrl: './hottest-day.component.html',
  styleUrls: ['./hottest-day.component.scss']
})
export class HottestDayComponent implements OnInit {
  conditions = new Map<String, String>();
  getConditions = new ConditionMapPipe().transform;

  // hottestDay: string = 'October 15';
  date: number = 0;

  constructor(private apiService: ApiSummary, private widgetService: MiniWidgetsService) {

  }

  ngOnInit() {
    this.apiService.getSummary().subscribe((data: any) => {
      // let widgetData = data[0].widgets[0];
      this.date = data[0].widgets[0].date;
      let widgetData = this.widgetService.getWidgetData(data[0].widgets, 'hottest_day');

      console.log("widget data: ");
      console.log(widgetData);

      this.date = widgetData.date;
      this.conditions = this.getConditions(widgetData);

      // this.conditions.set('Average Temperature', widgetData.average_temp.toString());
      // this.conditions.set('Chance of Rain', widgetData.pop.toString());
      // this.conditions.set('Humidity', widgetData.humidity.toString());
    })
  }
}
