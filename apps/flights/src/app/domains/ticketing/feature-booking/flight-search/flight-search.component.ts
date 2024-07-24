import {
  Component,
  ElementRef,
  NgZone,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightCardComponent } from '../flight-card/flight-card.component';
import { CityPipe } from '@demo/shared/ui-common';
import { Flight, FlightService } from '@demo/ticketing/data';
import { addMinutes } from 'date-fns';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  debounceTime,
  filter,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  imports: [CommonModule, FormsModule, CityPipe, FlightCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightSearchComponent {
  private element = inject(ElementRef);
  private zone = inject(NgZone);

  private flightService = inject(FlightService);

  private snackBar = inject(MatSnackBar);

  from = signal('Paris');
  to = signal('London');

  from$ = toObservable(this.from);
  to$ = toObservable(this.to);

  flights$ = combineLatest({ from: this.from$, to: this.to$ }).pipe(
    filter((c) => c.from.length >= 3 && c.to.length >= 3),
    debounceTime(300),
    tap((c) => console.log('searching flights', c)),
    switchMap((c) => this.find(c.from, c.to))
  );

  flights = toSignal(this.flights$, {
    initialValue: [],
  });

  delayTime = signal(0);

  flightsWithDelays = computed(() =>
    this.toFlightsWithDelays(this.flights(), this.delayTime())
  );

  flightsRoute = computed(() => `${this.from()} -> ${this.to()}`);

  basket = signal<Record<number, boolean>>({
    3: true,
    5: true,
  });

  constructor() {
    effect(() => {
      console.log(this.flightsRoute());
    });

    effect(() => {
      if (this.from() === this.to()) {
        this.snackBar.open('Round Trips are not supported', 'Ok', {
          duration: 3000,
        });
      }
    });
  }

  find(from: string, to: string): Observable<Flight[]> {
    return this.flightService.find(from, to).pipe(
      catchError((error) => {
        console.log(error);
        return of([]);
      })
    );
  }

  delay(): void {
    // this.flights.set(this.toFlightsWithDelays(this.flights(), 15));
    // this.flights.update((flights) => this.toFlightsWithDelays(flights, 15));
    this.delayTime.update((delay) => delay + 15);
  }

  toFlightsWithDelays(flights: Flight[], delay: number): Flight[] {
    if (flights.length === 0) {
      return [];
    }

    const oldFlights = flights;
    const oldFlight = oldFlights[0];
    const oldDate = new Date(oldFlight.date);
    const newDate = addMinutes(oldDate, delay);

    const newFlight = { ...oldFlight, date: newDate.toISOString() };

    return [newFlight, ...flights.slice(1)];
  }

  updateBasket(flightId: number, selected: boolean) {
    this.basket.update((value) => ({ ...value, [flightId]: selected }));
  }

  blink() {
    // Dirty Hack used to visualize the change detector
    this.element.nativeElement.firstChild.style.backgroundColor = 'crimson';

    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.element.nativeElement.firstChild.style.backgroundColor = 'white';
      }, 1000);
    });

    return null;
  }
}
