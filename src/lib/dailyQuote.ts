// Modobeam — daily quotes
// One quote per calendar day, deterministic (same quote for everyone on the
// same day). Rotates at local midnight. Tone: calm, reflective, human —
// never spiritual, predictive, or self-help cliché.

export interface DailyQuote {
  text: string;
  author?: string;
}

const QUOTES: DailyQuote[] = [
  { text: "The quieter you become, the more you can hear.", author: "Ram Dass" },
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl" },
  { text: "What you seek is seeking you.", author: "Rumi" },
  { text: "We don't see things as they are, we see them as we are.", author: "Anaïs Nin" },
  { text: "The most important kind of freedom is to be what you really are.", author: "Jim Morrison" },
  { text: "You can't stop the waves, but you can learn to surf.", author: "Jon Kabat-Zinn" },
  { text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott" },
  { text: "Owning our story and loving ourselves through that process is the bravest thing we'll ever do.", author: "Brené Brown" },
  { text: "What we don't need in the midst of struggle is shame for being human.", author: "Brené Brown" },
  { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
  { text: "Be patient toward all that is unsolved in your heart.", author: "Rainer Maria Rilke" },
  { text: "We must be willing to let go of the life we planned so as to have the life that is waiting for us.", author: "Joseph Campbell" },
  { text: "Tell me, what is it you plan to do with your one wild and precious life?", author: "Mary Oliver" },
  { text: "You do not have to be good. You only have to let the soft animal of your body love what it loves.", author: "Mary Oliver" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "Each day is a little life: every waking and rising a little birth.", author: "Arthur Schopenhauer" },
  { text: "Don't believe everything you think.", author: "Allan Lokos" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "Sometimes the most important thing in a whole day is the rest we take between two deep breaths.", author: "Etty Hillesum" },
  { text: "Caring for yourself is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
  { text: "Notice what you notice.", author: "Allen Ginsberg" },
  { text: "What you resist, persists.", author: "Carl Jung" },
  { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "Comparison is the thief of joy.", author: "Theodore Roosevelt" },
  { text: "Nothing ever goes away until it has taught us what we need to know.", author: "Pema Chödrön" },
  { text: "You are the sky. Everything else is just the weather.", author: "Pema Chödrön" },
  { text: "Don't ask what the world needs. Ask what makes you come alive, and go do it.", author: "Howard Thurman" },
  { text: "We don't grow when things are easy; we grow when we face challenges.", author: "Joyce Meyer" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Slow down and everything you are chasing will come around and catch you.", author: "John De Paola" },
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung" },
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
  { text: "You may not control all the events that happen to you, but you can decide not to be reduced by them.", author: "Maya Angelou" },
  { text: "The most beautiful people are those who have known defeat, struggle, loss, and have found their way out of those depths.", author: "Elisabeth Kübler-Ross" },
  { text: "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.", author: "Rumi" },
  { text: "If you correct your mind, the rest of your life will fall into place.", author: "Lao Tzu" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Finish each day and be done with it. You have done what you could.", author: "Ralph Waldo Emerson" },
  { text: "The best way out is always through.", author: "Robert Frost" },
  { text: "Whatever you are, be a good one.", author: "Abraham Lincoln" },
  { text: "Be soft. Do not let the world make you hard.", author: "Iain Thomas" },
  { text: "Healing doesn't mean the damage never existed. It means the damage no longer controls our lives." },
  { text: "Sometimes you don't need a goal in life. You don't need to know the big picture. You just need to know what you're going to do next." },
  { text: "Rest is not idleness. To lie sometimes on the grass under the trees is by no means a waste of time.", author: "John Lubbock" },
];

// Days since the Unix epoch (local time). Used to pick a stable index per day.
function daysSinceEpoch(d = new Date()): number {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(local.getTime() / (1000 * 60 * 60 * 24));
}

export function getDailyQuote(d = new Date()): DailyQuote {
  const idx = daysSinceEpoch(d) % QUOTES.length;
  return QUOTES[idx];
}

// Milliseconds until the next local midnight — used to refresh the quote
// without a full reload if the app stays open across midnight.
export function msUntilNextMidnight(d = new Date()): number {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return next.getTime() - d.getTime();
}
