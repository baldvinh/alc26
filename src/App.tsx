import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Beer,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Plane,
  ReceiptText,
  Route,
  Users
} from "lucide-react";

type PaymentState = "paid" | "awaiting";
type BookingState = "not-started" | "requested" | "reserved" | "paid";

type Person = { id: number; name: string; payment: PaymentState };
type BudgetLine = { id: string; label: string; budget: number; actual: number };
type Booking = { id: string; label: string; provider: string; state: BookingState; href?: string };

type TripState = {
  people: Person[];
  budget: BudgetLine[];
  bookings: Booking[];
};

const INITIAL: TripState = {
  people: [
    { id: 1, name: "Baldvin", payment: "paid" },
    { id: 2, name: "Gaur 2", payment: "awaiting" },
    { id: 3, name: "Gaur 3", payment: "awaiting" },
    { id: 4, name: "Gaur 4", payment: "awaiting" }
  ],
  budget: [
    { id: "flight", label: "Icelandair + golf bags", budget: 440000, actual: 0 },
    { id: "golf", label: "Hotel + golf + buggies", budget: 560000, actual: 0 },
    { id: "spain", label: "Spain private transport", budget: 160000, actual: 0 },
    { id: "kef", label: "Reykjavík ↔ KEF private van", budget: 60000, actual: 0 },
    { id: "live", label: "Food + beer + local transport", budget: 400000, actual: 0 },
    { id: "buffer", label: "Buffer", budget: 180000, actual: 0 }
  ],
  bookings: [
    { id: "icelandair", label: "KEF ↔ ALC flights", provider: "Icelandair", state: "not-started", href: "https://www.icelandair.com/" },
    { id: "bags", label: "Golf bags x4", provider: "Icelandair", state: "not-started", href: "https://www.icelandair.com/" },
    { id: "hotel", label: "Central Alicante hotel", provider: "Golfbreaks", state: "not-started", href: "https://www.golfbreaks.com/en-gb/holidays/alicante/" },
    { id: "lafinca", label: "La Finca — 28 Nov", provider: "Golfbreaks", state: "not-started", href: "https://www.golfbreaks.com/en-gb/holidays/alicante/" },
    { id: "colinas", label: "Las Colinas — 29 Nov", provider: "Golfbreaks", state: "not-started", href: "https://www.golfbreaks.com/en-gb/holidays/alicante/" },
    { id: "font", label: "Font del Llop — 30 Nov", provider: "Golfbreaks", state: "not-started", href: "https://www.golfbreaks.com/en-gb/holidays/alicante/" },
    { id: "vans", label: "All Spain private vans", provider: "Golf-Drives", state: "not-started", href: "https://www.golf-drives.com/resort-transfers/spain/alicante/" },
    { id: "hreyfill", label: "Reykjavík ↔ KEF private van", provider: "Hreyfill", state: "not-started", href: "https://www.hreyfill.is/en/" }
  ]
};

const itinerary = [
  {
    day: "FRI 27 NOV",
    title: "GET OUT",
    lead: "Reykjavík → KEF → Alicante",
    entries: [
      ["12:15", "Meet at one Reykjavík pickup point"],
      ["12:30", "Private van → KEF"],
      ["14:15", "Food + first airport beers"],
      ["16:25", "KEF → ALC"],
      ["21:55", "Land Alicante"],
      ["22:25", "Private van → hotel"],
      ["23:20", "Late food + beers"],
      ["01:00", "Bed"]
    ]
  },
  {
    day: "SAT 28 NOV",
    title: "LA FINCA",
    lead: "Opening round",
    entries: [
      ["09:00", "Big breakfast"],
      ["09:45", "Private golf van"],
      ["10:30", "Warm-up"],
      ["11:00", "Tee time"],
      ["15:30", "Finish"],
      ["15:30", "Clubhouse food + beers"],
      ["17:15", "Van → Alicante"],
      ["18:15", "Shower / nap / chill"],
      ["20:30", "Proper dinner"],
      ["22:30", "Bars + beers"]
    ]
  },
  {
    day: "SUN 29 NOV",
    title: "LAS COLINAS",
    lead: "Marquee round",
    entries: [
      ["08:45", "Breakfast"],
      ["09:20", "Private van"],
      ["10:20", "Range + coffee"],
      ["11:00", "Tee time"],
      ["15:30", "Finish"],
      ["15:30", "Clubhouse food + beers"],
      ["17:00", "Van → Alicante"],
      ["18:00", "Nap / shower"],
      ["20:30", "Spanish dinner"],
      ["22:30", "Bars + beer"]
    ]
  },
  {
    day: "MON 30 NOV",
    title: "FONT DEL LLOP",
    lead: "Final round",
    entries: [
      ["09:00", "Breakfast"],
      ["09:45", "Private van"],
      ["10:15", "Warm-up"],
      ["11:00", "Tee time"],
      ["15:30", "Finish"],
      ["15:30", "Long clubhouse session"],
      ["17:15", "Van → Alicante"],
      ["17:45", "Nap / shower / chill"],
      ["20:30", "Big final dinner"],
      ["22:30", "Beers"]
    ]
  },
  {
    day: "TUE 1 DEC",
    title: "HOME",
    lead: "Alicante → KEF → Reykjavík",
    entries: [
      ["09:45", "Long breakfast"],
      ["11:00", "Pack clubs"],
      ["11:30", "Lunch / final beer"],
      ["12:15", "Private van → airport"],
      ["13:30", "Food + beer"],
      ["15:10", "ALC → KEF"],
      ["19:00", "Land KEF"],
      ["19:40", "Private van → Reykjavík"],
      ["20:30", "Done"]
    ]
  }
];

const courses = [
  { no: "01", name: "LA FINCA", note: "Opening round", drive: "~50 min", date: "SAT 28 NOV · 11:00" },
  { no: "02", name: "LAS COLINAS", note: "Marquee round", drive: "~65 min", date: "SUN 29 NOV · 11:00" },
  { no: "03", name: "FONT DEL LLOP", note: "Final round", drive: "~30 min", date: "MON 30 NOV · 11:00" }
];

const money = (value: number) => new Intl.NumberFormat("is-IS").format(value) + " kr.";
const bookingLabels: Record<BookingState, string> = {
  "not-started": "NOT STARTED",
  requested: "REQUESTED",
  reserved: "RESERVED",
  paid: "PAID"
};
const bookingCycle: BookingState[] = ["not-started", "requested", "reserved", "paid"];

function App() {
  const [state, setState] = useState<TripState>(() => {
    const saved = localStorage.getItem("alc26-state");
    return saved ? JSON.parse(saved) : INITIAL;
  });
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    localStorage.setItem("alc26-state", JSON.stringify(state));
  }, [state]);

  const collected = state.people.filter((p) => p.payment === "paid").length * 450000;
  const totalBudget = state.budget.reduce((sum, x) => sum + x.budget, 0);
  const actual = state.budget.reduce((sum, x) => sum + x.actual, 0);
  const remaining = totalBudget - actual;
  const bookingsDone = state.bookings.filter((b) => b.state === "paid").length;

  const nextUp = useMemo(() => {
    const unpaid = state.people.find((p) => p.payment !== "paid");
    if (unpaid) return `Collect 450.000 kr. from ${unpaid.name}`;
    const booking = state.bookings.find((b) => b.state !== "paid");
    if (booking) return `Lock ${booking.label}`;
    return "Trip is operationally ready";
  }, [state]);

  const updatePerson = (id: number, patch: Partial<Person>) =>
    setState((s) => ({ ...s, people: s.people.map((p) => p.id === id ? { ...p, ...patch } : p) }));

  const updateActual = (id: string, value: number) =>
    setState((s) => ({ ...s, budget: s.budget.map((b) => b.id === id ? { ...b, actual: value } : b) }));

  const cycleBooking = (id: string) =>
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => {
        if (b.id !== id) return b;
        const i = bookingCycle.indexOf(b.state);
        return { ...b, state: bookingCycle[(i + 1) % bookingCycle.length] };
      })
    }));

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top">ALC<span>&gt;</span>26</a>
        <nav>
          <a href="#plan">PLAN</a>
          <a href="#golf">GOLF</a>
          <a href="#money">MONEY</a>
          <a href="#bookings">BOOKINGS</a>
        </nav>
        <div className="status-dot"><span /> NOV 27 — DEC 01</div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow">ALICANTE · 2026</div>
          <h1>GOLF.<br />FOOD.<br />BEER<span>&gt;</span><br />REPEAT.</h1>
          <div className="hero-side">
            <div className="rule" />
            <h2>4 guys.<br />4 nights.<br />3 rounds.<br />0 sober drivers.</h2>
            <p>Everything important prepaid. One payer for shared spend. Private vans. Late-morning tee times. Long clubhouse sessions.</p>
            <a className="text-link" href="#plan">SEE THE PLAN <ChevronRight size={18} /></a>
          </div>
        </section>

        <section className="strip">
          <div><span>TRIP POT</span><strong>{money(totalBudget)}</strong></div>
          <div><span>PER GUY</span><strong>450.000 kr.</strong></div>
          <div><span>COLLECTED</span><strong>{money(collected)}</strong></div>
          <div><span>BOOKED</span><strong>{bookingsDone}/{state.bookings.length}</strong></div>
        </section>

        <section className="next-up">
          <span>NEXT UP</span>
          <strong>{nextUp}</strong>
          <ArrowUpRight size={28} />
        </section>

        <section className="section" id="plan">
          <div className="section-head">
            <div><span className="kicker">01 / PLAN</span><h2>The rhythm.</h2></div>
            <p>Wake. Breakfast. Van. Golf. Clubhouse beers. Van. Nap. Dinner. More beers. Repeat.</p>
          </div>

          <div className="day-tabs">
            {itinerary.map((d, i) => (
              <button key={d.day} className={activeDay === i ? "active" : ""} onClick={() => setActiveDay(i)}>
                <span>{d.day}</span>{d.title}
              </button>
            ))}
          </div>

          <div className="timeline-wrap">
            <div className="timeline-title">
              <span>{itinerary[activeDay].day}</span>
              <h3>{itinerary[activeDay].title}</h3>
              <p>{itinerary[activeDay].lead}</p>
            </div>
            <div className="timeline">
              {itinerary[activeDay].entries.map(([time, label]) => (
                <div className="timeline-row" key={time + label}>
                  <time>{time}</time><div className="timeline-mark" /><span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="golf">
          <div className="section-head">
            <div><span className="kicker">02 / GOLF</span><h2>Three rounds. No filler.</h2></div>
            <p>11:00-ish tee times protect sleep, daylight and the 19th hole.</p>
          </div>
          <div className="course-grid">
            {courses.map((c) => (
              <article className="course" key={c.no}>
                <div className="course-no">{c.no}</div>
                <div>
                  <span>{c.date}</span>
                  <h3>{c.name}</h3>
                  <p>{c.note}</p>
                </div>
                <div className="course-drive"><Route size={18}/>{c.drive} from Alicante</div>
              </article>
            ))}
          </div>
          <div className="route-line">
            <span>REYKJAVÍK</span><i /> <span>KEF</span><i /> <span>ALC</span><i /> <strong>ALICANTE</strong>
          </div>
        </section>

        <section className="section" id="money">
          <div className="section-head">
            <div><span className="kicker">03 / MONEY</span><h2>Prepay everything. Think about nothing.</h2></div>
            <p>Baldvin pays every shared expense. Personal purchases stay personal.</p>
          </div>

          <div className="money-layout">
            <div className="funding-panel">
              <div className="funding-total">
                <span>FUNDED</span><strong>{money(collected)}</strong><small>of {money(totalBudget)}</small>
              </div>
              <div className="progress"><span style={{width: `${Math.min(100, collected / totalBudget * 100)}%`}} /></div>
              <div className="people">
                {state.people.map((p) => (
                  <div className="person" key={p.id}>
                    <input value={p.name} onChange={(e) => updatePerson(p.id,{name:e.target.value})} />
                    <button className={p.payment} onClick={() => updatePerson(p.id,{payment:p.payment === "paid" ? "awaiting" : "paid"})}>
                      {p.payment === "paid" ? <Check size={15}/> : null}{p.payment.toUpperCase()}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="budget-panel">
              <div className="budget-head"><span>CATEGORY</span><span>BUDGET</span><span>ACTUAL</span></div>
              {state.budget.map((b) => (
                <div className="budget-row" key={b.id}>
                  <span>{b.label}</span>
                  <strong>{money(b.budget)}</strong>
                  <label><input inputMode="numeric" value={b.actual || ""} placeholder="0" onChange={(e)=>updateActual(b.id, Number(e.target.value.replace(/\D/g,"")) || 0)} /><small>ISK</small></label>
                </div>
              ))}
              <div className="budget-total">
                <span>REMAINING</span><strong>{money(remaining)}</strong><small>{money(Math.max(0, remaining/4))} theoretical refund / guy</small>
              </div>
            </div>
          </div>

          <div className="rule-card">
            <CircleDollarSign size={22}/>
            <div><span>THE RULE</span><strong>Shared trip = group pays. Personal shit = you pay.</strong></div>
            <p>€100 football shirt? Your card. Four steaks and twenty beers? Trip card.</p>
          </div>
        </section>

        <section className="section" id="bookings">
          <div className="section-head">
            <div><span className="kicker">04 / BOOKINGS</span><h2>Lock the infrastructure.</h2></div>
            <p>No booking happens until the 1.8m trip pot is funded.</p>
          </div>
          <div className="booking-list">
            {state.bookings.map((b, i) => (
              <div className="booking-row" key={b.id}>
                <span className="booking-num">{String(i+1).padStart(2,"0")}</span>
                <div><strong>{b.label}</strong><small>{b.provider}</small></div>
                <button className={`booking-state ${b.state}`} onClick={()=>cycleBooking(b.id)}>{bookingLabels[b.state]}</button>
                {b.href ? <a href={b.href} target="_blank" rel="noreferrer"><ArrowUpRight size={18}/></a> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="manifesto">
          <div className="manifesto-icons"><Plane/><CalendarDays/><Beer/><ReceiptText/></div>
          <h2>THE OTHER THREE GUYS HAVE THREE RESPONSIBILITIES.</h2>
          <div className="manifesto-grid">
            <div><span>01</span><strong>SHOW UP.</strong></div>
            <div><span>02</span><strong>PLAY GOLF.</strong></div>
            <div><span>03</span><strong>DRINK BEER.</strong></div>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#top">ALC<span>&gt;</span>26</a>
        <p>Alicante · 27 Nov — 1 Dec 2026</p>
        <div><Users size={16}/> 4 guys <Clock3 size={16}/> 5 days</div>
      </footer>
    </div>
  );
}

export default App;
