const RANKS: readonly string[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS: readonly string[] = ['s', 'h', 'd', 'c'];

export class MinPokerDeck {
  private cards: string[];

  constructor() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push(`${rank}${suit}`);
      }
    }
  }

  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public deal(count: number): string[] {
    if (this.cards.length < count) {
      throw new Error('Not enough cards in deck');
    }
    return this.cards.splice(0, count);
  }

  public getCardCount(): number {
    return this.cards.length;
  }
}
