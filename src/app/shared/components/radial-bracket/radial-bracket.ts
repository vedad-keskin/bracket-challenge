import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { BracketService } from '../../../core/services/bracket.service';
import { Team, Match, Round } from '../../../core/models/bracket.model';

export interface RadialNode {
  x: number;
  y: number;
  angleDeg: number;
  match: Match;
  slotIndex: number;
  team: Team | null;
  isWinner: boolean;
  isLoser: boolean;
  round: Round;
  side: 'left' | 'right' | 'center';
  matchIndex: number;
}

export interface ConnectorPath {
  d: string;
  winnerPath: boolean;
}

export interface JunctionDot {
  x: number;
  y: number;
}

interface ForkResult {
  paths: ConnectorPath[];
  junctions: JunctionDot[];
}

interface XY {
  x: number;
  y: number;
}

/** Clockwise ring order: R0–R7 down the right arc, L7–L0 up the left arc (L0 west of top, R0 east). */
const R32_RING_ORDER: ReadonlyArray<{ side: 'left' | 'right'; matchIdx: number }> = [
  { side: 'right', matchIdx: 0 },
  { side: 'right', matchIdx: 1 },
  { side: 'right', matchIdx: 2 },
  { side: 'right', matchIdx: 3 },
  { side: 'right', matchIdx: 4 },
  { side: 'right', matchIdx: 5 },
  { side: 'right', matchIdx: 6 },
  { side: 'right', matchIdx: 7 },
  { side: 'left', matchIdx: 7 },
  { side: 'left', matchIdx: 6 },
  { side: 'left', matchIdx: 5 },
  { side: 'left', matchIdx: 4 },
  { side: 'left', matchIdx: 3 },
  { side: 'left', matchIdx: 2 },
  { side: 'left', matchIdx: 1 },
  { side: 'left', matchIdx: 0 },
];

const R32_PAIR_COUNT = 16;
const R32_PAIR_STEP = 360 / R32_PAIR_COUNT;
const R32_INTRA_PAIR_OFFSET = 5.5;

@Component({
  selector: 'app-radial-bracket',
  standalone: true,
  imports: [],
  templateUrl: './radial-bracket.html',
  styleUrl: './radial-bracket.css',
})
export class RadialBracketComponent {
  readonly bracketService = inject(BracketService);

  readonly SIZE = 900;
  readonly CENTER = this.SIZE / 2;

  readonly R: Record<string, number> = {
    [Round.R32]: 0.95,
    [Round.R16]: 0.76,
    [Round.QF]: 0.57,
    [Round.SF]: 0.40,
    [Round.FINAL]: 0.24,
  };

  readonly NODE_SIZES: Record<string, number> = {
    [Round.R32]: 80,
    [Round.R16]: 34,
    [Round.QF]: 32,
    [Round.SF]: 34,
    [Round.FINAL]: 36,
  };

  readonly hoveredNode = signal<RadialNode | null>(null);
  readonly tooltipX = signal(0);
  readonly tooltipY = signal(0);

  readonly r32Nodes = computed(() =>
    this.buildR32Nodes(this.bracketService.leftR32(), this.bracketService.rightR32())
  );

  readonly r16Nodes = computed(() =>
    this.buildDerivedNodes(
      Round.R16,
      this.r32Nodes(),
      this.bracketService.leftR16(),
      this.bracketService.rightR16()
    )
  );

  readonly qfNodes = computed(() =>
    this.buildDerivedNodes(
      Round.QF,
      this.r16Nodes(),
      this.bracketService.leftQF(),
      this.bracketService.rightQF()
    )
  );

  readonly sfNodes = computed(() =>
    this.buildDerivedNodes(
      Round.SF,
      this.qfNodes(),
      this.bracketService.leftSF(),
      this.bracketService.rightSF()
    )
  );

  readonly finalNodes = computed(() => this.buildFinalNodes());

  readonly thirdPlaceMatch = computed(() => this.bracketService.thirdPlace()[0] ?? null);
  readonly thirdPlaceWinner = computed(() => this.bracketService.thirdPlaceWinner());
  readonly champion = computed(() => this.bracketService.champion());

  readonly r32Connectors = computed(() => this.buildRoundForks(this.r32Nodes(), this.r16Nodes()));
  readonly r16Connectors = computed(() => this.buildRoundForks(this.r16Nodes(), this.qfNodes()));
  readonly qfConnectors = computed(() => this.buildRoundForks(this.qfNodes(), this.sfNodes()));
  readonly sfConnectors = computed(() => this.buildSfToFinalForks(this.sfNodes(), this.finalNodes()));

  readonly Round = Round;

  readonly allNodes = computed(() => [
    ...this.r32Nodes(),
    ...this.r16Nodes(),
    ...this.qfNodes(),
    ...this.sfNodes(),
    ...this.finalNodes(),
  ]);

  readonly allConnectors = computed(() => [
    ...this.r32Connectors().paths,
    ...this.r16Connectors().paths,
    ...this.qfConnectors().paths,
    ...this.sfConnectors().paths,
  ]);

  readonly allJunctions = computed(() => [
    ...this.r32Connectors().junctions,
    ...this.r16Connectors().junctions,
    ...this.qfConnectors().junctions,
    ...this.sfConnectors().junctions,
  ]);

  // ─── Node building ───

  private buildR32Nodes(left: Match[], right: Match[]): RadialNode[] {
    const nodes: RadialNode[] = [];
    const radius = this.R[Round.R32] * this.CENTER;
    const angleMap = this.buildR32AngleMap();

    right.forEach((m, i) => {
      nodes.push(this.mk(m, 0, m.team1, angleMap.get(`right-${i}-0`)!, radius, Round.R32, 'right', i));
      nodes.push(this.mk(m, 1, m.team2, angleMap.get(`right-${i}-1`)!, radius, Round.R32, 'right', i));
    });
    left.forEach((m, i) => {
      nodes.push(this.mk(m, 0, m.team1, angleMap.get(`left-${i}-0`)!, radius, Round.R32, 'left', i));
      nodes.push(this.mk(m, 1, m.team2, angleMap.get(`left-${i}-1`)!, radius, Round.R32, 'left', i));
    });
    return nodes;
  }

  private buildR32AngleMap(): Map<string, number> {
    const map = new Map<string, number>();
    R32_RING_ORDER.forEach(({ side, matchIdx }, pairIndex) => {
      const center = pairIndex * R32_PAIR_STEP + R32_PAIR_STEP / 2;
      map.set(`${side}-${matchIdx}-0`, center - R32_INTRA_PAIR_OFFSET);
      map.set(`${side}-${matchIdx}-1`, center + R32_INTRA_PAIR_OFFSET);
    });
    return map;
  }

  private buildDerivedNodes(
    round: Round,
    parentNodes: RadialNode[],
    left: Match[],
    right: Match[]
  ): RadialNode[] {
    const nodes: RadialNode[] = [];
    const radius = this.R[round] * this.CENTER;

    for (const side of ['right', 'left'] as const) {
      const matches = side === 'right' ? right : left;
      const parentSide = parentNodes.filter(n => n.side === side);

      matches.forEach((m, matchIdx) => {
        for (const slot of [0, 1] as const) {
          const parentMatchIdx = matchIdx * 2 + slot;
          const p1 = parentSide[parentMatchIdx * 2];
          const p2 = parentSide[parentMatchIdx * 2 + 1];
          const angle = p1 && p2 ? this.midAngle(p1.angleDeg, p2.angleDeg) : 0;
          const team = slot === 0 ? m.team1 : m.team2;
          nodes.push(this.mk(m, slot, team, angle, radius, round, side, matchIdx));
        }
      });
    }
    return nodes;
  }

  private buildFinalNodes(): RadialNode[] {
    const matches = this.bracketService.final();
    if (!matches.length) return [];
    const m = matches[0];
    const r = this.R[Round.FINAL] * this.CENTER;
    const sf = this.sfNodes();
    const leftSf = sf.filter(n => n.side === 'left');
    const rightSf = sf.filter(n => n.side === 'right');
    const leftAngle = leftSf.length >= 2
      ? this.midAngle(leftSf[0].angleDeg, leftSf[1].angleDeg)
      : 270;
    const rightAngle = rightSf.length >= 2
      ? this.midAngle(rightSf[0].angleDeg, rightSf[1].angleDeg)
      : 90;

    return [
      this.mk(m, 0, m.team1, leftAngle, r, Round.FINAL, 'left', 0),
      this.mk(m, 1, m.team2, rightAngle, r, Round.FINAL, 'right', 0),
    ];
  }

  // ─── Stepped rectangular connectors ───

  private buildRoundForks(outer: RadialNode[], inner: RadialNode[]): ForkResult {
    const paths: ConnectorPath[] = [];
    const junctions: JunctionDot[] = [];
    if (!outer.length || !inner.length) return { paths, junctions };

    const outerRound = outer[0].round;
    const innerRound = inner[0].round;
    const junctionR = ((this.R[outerRound] + this.R[innerRound]) / 2) * this.CENTER;

    for (const side of ['right', 'left'] as const) {
      const outerSide = outer.filter(n => n.side === side);
      const innerSide = inner.filter(n => n.side === side);
      const matchCount = outerSide.length / 2;

      for (let matchIdx = 0; matchIdx < matchCount; matchIdx++) {
        const t1 = outerSide[matchIdx * 2];
        const t2 = outerSide[matchIdx * 2 + 1];
        const target = innerSide[matchIdx];
        if (!t1 || !t2 || !target) continue;

        const jAngle = this.midAngle(t1.angleDeg, t2.angleDeg);
        const jPos = this.angleToXY(jAngle, junctionR);
        junctions.push(jPos);

        const winner = t1.match.winner;
        const decided = winner !== null;
        const targetIsWinner = decided && target.team?.id === winner.id;

        paths.push(...this.rectTeamPaths(t1, junctionR, jPos, t1.isWinner && decided));
        paths.push(...this.rectTeamPaths(t2, junctionR, jPos, t2.isWinner && decided));
        paths.push({
          d: this.polyline([jPos, { x: target.x, y: target.y }]),
          winnerPath: targetIsWinner,
        });
      }
    }
    return { paths, junctions };
  }

  private buildSfToFinalForks(sf: RadialNode[], fin: RadialNode[]): ForkResult {
    const paths: ConnectorPath[] = [];
    const junctions: JunctionDot[] = [];
    const junctionR = ((this.R[Round.SF] + this.R[Round.FINAL]) / 2) * this.CENTER;

    for (const side of ['left', 'right'] as const) {
      const sfSide = sf.filter(n => n.side === side);
      const finalNode = fin.find(n => n.side === side);
      if (sfSide.length < 2 || !finalNode) continue;

      const t1 = sfSide[0];
      const t2 = sfSide[1];
      const jAngle = this.midAngle(t1.angleDeg, t2.angleDeg);
      const jPos = this.angleToXY(jAngle, junctionR);
      junctions.push(jPos);

      const winner = t1.match.winner;
      const decided = winner !== null;
      const targetIsWinner = decided && finalNode.team?.id === winner.id;

      paths.push(...this.rectTeamPaths(t1, junctionR, jPos, t1.isWinner && decided));
      paths.push(...this.rectTeamPaths(t2, junctionR, jPos, t2.isWinner && decided));
      paths.push({
        d: this.polyline([jPos, { x: finalNode.x, y: finalNode.y }]),
        winnerPath: targetIsWinner,
      });
    }
    return { paths, junctions };
  }

  private rectTeamPaths(node: RadialNode, junctionR: number, junction: XY, winnerPath: boolean): ConnectorPath[] {
    const elbow = this.angleToXY(node.angleDeg, junctionR);
    return [
      { d: this.polyline([{ x: node.x, y: node.y }, elbow, junction]), winnerPath },
    ];
  }

  // ─── Helpers ───

  private midAngle(a: number, b: number): number {
    return (a + b) / 2;
  }

  private angleToXY(deg: number, radius: number): XY {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: this.CENTER + radius * Math.cos(rad),
      y: this.CENTER + radius * Math.sin(rad),
    };
  }

  private polyline(points: XY[]): string {
    if (!points.length) return '';
    const [first, ...rest] = points;
    return `M${first.x.toFixed(1)},${first.y.toFixed(1)}` +
      rest.map(p => ` L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
  }

  private mk(
    match: Match,
    slot: number,
    team: Team | null,
    angleDeg: number,
    radius: number,
    round: Round,
    side: 'left' | 'right' | 'center',
    matchIndex: number
  ): RadialNode {
    const { x, y } = this.angleToXY(angleDeg, radius);
    const isWinner = team !== null && match.winner?.id === team.id;
    const isLoser = team !== null && match.winner !== null && match.winner.id !== team.id;
    return { x, y, angleDeg, match, slotIndex: slot, team, isWinner, isLoser, round, side, matchIndex };
  }

  getCrestOffset(node: RadialNode): string {
    const rad = ((node.angleDeg - 90) * Math.PI) / 180;
    const d = 10;
    const x = Math.cos(rad) * d;
    const y = Math.sin(rad) * d;
    return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }

  getCrestTransform(node: RadialNode): string {
    return `translate(-50%, -50%) ${this.getCrestOffset(node)}`;
  }

  // ─── Interaction ───

  onNodeClick(node: RadialNode): void {
    if (!node.team) return;
    if (this.bracketService.isLocked(node.match.id)) return;
    if (!node.match.team1 || !node.match.team2) return;
    this.bracketService.selectWinner(node.match.id, node.team);
  }

  onThirdPlaceClick(team: Team | null): void {
    const m = this.thirdPlaceMatch();
    if (!team || !m) return;
    if (this.bracketService.isLocked(m.id)) return;
    if (!m.team1 || !m.team2) return;
    this.bracketService.selectWinner(m.id, team);
  }

  isClickable(node: RadialNode): boolean {
    if (!node.team) return false;
    if (this.bracketService.isLocked(node.match.id)) return false;
    return node.match.team1 !== null && node.match.team2 !== null;
  }

  isThirdPlaceClickable(team: Team | null): boolean {
    const m = this.thirdPlaceMatch();
    if (!team || !m) return false;
    if (this.bracketService.isLocked(m.id)) return false;
    return m.team1 !== null && m.team2 !== null;
  }

  isThirdPlaceLoser(team: Team | null): boolean {
    const m = this.thirdPlaceMatch();
    if (!team || !m?.winner) return false;
    return m.winner.id !== team.id;
  }

  isThirdPlaceWinner(team: Team | null): boolean {
    const m = this.thirdPlaceMatch();
    if (!team || !m?.winner) return false;
    return m.winner.id === team.id;
  }

  showCrest(round: Round): boolean {
    return round === Round.R32;
  }

  getNodeSize(round: Round | string): number {
    return this.NODE_SIZES[round] ?? 26;
  }

  onNodeHover(node: RadialNode, event: MouseEvent): void {
    this.hoveredNode.set(node);
    this.tooltipX.set(event.clientX);
    this.tooltipY.set(event.clientY);
  }

  onTeamHover(team: Team, event: MouseEvent): void {
    this.tooltipX.set(event.clientX);
    this.tooltipY.set(event.clientY);
  }

  onNodeLeave(): void {
    this.hoveredNode.set(null);
  }

  trackNode(_: number, node: RadialNode): string {
    return `${node.match.id}-${node.slotIndex}-${node.round}`;
  }
}
