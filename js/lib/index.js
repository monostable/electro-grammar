const {ElectroGrammarLexer} = require('./ElectroGrammarLexer');
const {ElectroGrammarParser} = require('./ElectroGrammarParser');
const {ElectroGrammarListener} = require('./ElectroGrammarListener');
const antlr4 = require('antlr4');

function handle_unit(ctx, prefix) {
  return  Number(ctx.NUMBER().getText + prefix);
}

function handle_prefix(ctx) {
  if (ctx.hasAttribute('GIGA') && ctx.GIGA()) {
    return 'e9';
  }
  if (ctx.hasAttribute('MEGA') && ctx.MEGA()) {
    return 'e6';
  }
  if (ctx.hasAttribute('KILO') && ctx.KILO()) {
    return 'e3';
  }
  if (ctx.hasAttribute('MILI') && ctx.MILI()) {
    return 'e-3';
  }
  if (ctx.hasAttribute('MICRO') && ctx.MICRO()) {
    return 'e-6';
  }
  if (ctx.hasAttribute('NANO') && ctx.NANO()) {
    return 'e-9';
  }
  if (ctx.hasAttribute('PICO') && ctx.PICO()) {
    return 'e-12';
  }
  return '';
}

function handle_package_size(ctx) {
  if (ctx.hasAttribute('METRIC_SIZE') && ctx.METRIC_SIZE()) {
    return ctx.METRIX_SIZE().getText;
  }
  if (ctx.hasAttribute('IMPERIAL_SIZE') && ctx.IMPERIAL_SIZE()) {
    return ctx.IMPERIAL_SIZE().getText;
  }
  if (ctx.hasAttribute('AMBIGUOUS_SIZE') && ctx.AMBIGUOUS_SIZE()) {
    return ctx.AMBIGUOUS_SIZE().getText;
  }
}

class ElectroGrammarToObjectListener extends ElectroGrammarListener {
  constructor() {
    super();
    this.obj = {};
    this.prefix = 1;
  }
  exitVprefix(ctx) {
    this.prefix = handle_prefix(ctx);
  }
  exitVoltage(ctx) {
    this.obj['voltage'] = handle_unit(ctx, this.prefix);
    this.prefix = 1;
  }
  exitAprefix(ctx) {
    this.prefix = handle_prefix(ctx);
  }
  exitCurrent(ctx) {
    this.obj['current'] = handle_unit(ctx, this.prefix);
    this.prefix = 1;
  }
  exitPprefix(ctx) {
    this.prefix = handle_prefix(ctx);
  }
  exitPower(ctx) {
    this.obj['power'] = handle_unit(ctx, this.prefix);
    this.prefix = 1;
  }
  exitRprefix(ctx) {
    this.prefix = handle_prefix(ctx);
  }
  exitResistance(ctx) {
    this.obj['resistance'] = handle_unit(ctx, this.prefix);
    this.prefix = 1;
  }
  exitCprefix(ctx) {
    this.prefix = handle_prefix(ctx);
  }
  exitCapacitance(ctx) {
    this.obj['capacitance'] = handle_unit(ctx, this.prefix);
    this.prefix = 1;
  }
  exitLprefix(ctx) {
    this.prefix = handle_prefix(ctx);
  }
  exitInductance(ctx) {
    this.obj['inductance'] = handle_unit(ctx, this.prefix);
    this.prefix = 1;
  }
  exitFprefix(ctx) {
    this.prefix = handle_prefix(ctx);
  }
  exitFrequency(ctx) {
    this.obj['frequency'] = handle_unit(ctx, this.prefix);
    this.prefix = 1;
  }
  exitTprefix(ctx) {
    this.prefix = handle_prefix(ctx, this.prefix);
  }
  exitTime(ctx) {
    this.obj['time'] = handle_unit(ctx, this.prefix);
    this.prefix = 1;
  }
  exitTemperature(ctx) {
    this.obj['temperature'] = handle_unit(ctx, '');
  }
  exitTolerance(ctx) {
    this.obj['tolerance'] = handle_unit(ctx);
  }
  exitMetric_size(ctx) {
    var imperial_lookup = {
      '0201': '008004',
      '03015': '009005',
      '0402': '01005',
      '0603': '0201',
      '1005': '0402',
      '1608': '0603',
      '2012': '0805',
      '2520': '1008',
      '3216': '1206',
      '3225': '1210',
      '4516': '1806',
      '4532': '1812',
      '4564': '1825',
      '5025': '2010',
      '6332': '2512',
      '7451': '2920'
    };
    this.obj['package_size'] = imperial_lookup[handle_package_size(ctx)];
  }
  exitImperial_size(ctx) {
    this.obj['package_size'] = handle_package_size(ctx);
  }
  exitAmbiguous_size(ctx) {
    console.log('Warn: Ambiguous package size found');
    this.obj['package_size'] = handle_package_size(ctx);
  }
  exitClass1(ctx) {
    var dielectric;
    if (ctx.M7G()) {
      dielectric = 'M7G';
    }
    else if (ctx.C0G()) {
      dielectric = 'C0G';
    }
    else if (ctx.H2G()) {
      dielectric = 'H2G';
    }
    else if (ctx.L2G()) {
      dielectric = 'L2G';
    }
    else if (ctx.P2H()) {
      dielectric = 'P2H';
    }
    else if (ctx.R2H()) {
      dielectric = 'R2H';
    }
    else if (ctx.S2H()) {
      dielectric = 'S2H';
    }
    else if (ctx.T2H()) {
      dielectric = 'T2H';
    }
    else if (ctx.U2J()) {
      dielectric = 'U2J';
    }
    else if (ctx.Q3K()) {
      dielectric = 'Q3K';
    }
    else if (ctx.P3K()) {
      dielectric = 'P3K';
    }

    this.obj['dielectric'] = dielectric;
  }
  exitClass2(ctx) {
    this.obj['dielectric'] = ctx.CLASS2().getText.upper();
  }
  exitAlu(ctx) {
    this.obj['dielectric'] = 'ALU';
  }
  exitTan(ctx) {
    this.obj['dielectric'] = 'TAN';
  }
  exitResistor(ctx) {
    this.obj['type'] = 'resistor';
  }
  exitCapacitor(ctx) {
    this.obj['type'] = 'capacitor';
  }
  exitInductor(ctx) {
    this.obj['type'] = 'inductor';
  }
  exitOscillator(ctx) {
    this.obj['type'] = 'oscillator';
  }
  exitRtype(ctx) {
    if (ctx.POT())
      this.obj['rtype'] = 'pot';
  }
  exitDiode(ctx) {
    this.obj['type'] = 'diode';
  }
  exitDcode(ctx) {
    this.obj['code'] = ctx.DCODE().getText.upper();
  }
  exitSignal(ctx) {
    this.obj['dtype'] = 'signal';
  }
  exitRectifier(ctx) {
    this.obj['dtype'] = 'rectifier';
  }
  exitLed(ctx) {
    this.obj['dtype'] = 'led';
  }
  exitSchottky(ctx) {
    this.obj['dtype'] = 'schottky';
  }
  exitZener(ctx) {
    this.obj['dtype'] = 'zener';
  }
  exitColor(ctx) {
    this.obj['color'] = ctx.COLOR().getText.lower();
  }
  exitTransistor(ctx) {
    this.obj['type'] = 'transistor';
  }
  exitTtype(ctx) {
    this.obj['ttype'] = ctx.TTYPE().getText.lower();
  }
  exitTcode(ctx) {
    this.obj['code'] = ctx.TCODE().getText.upper();
  }
}

function parse(input) {
  const chars = new antlr4.InputStream(input);
  const lexer = new ElectroGrammarLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new ElectroGrammarParser(tokens);

  // enable grammar ambiguity diagnostic output
  // see Antlr book ch 9.2, page 156
  // https://github.com/antlr/antlr4/issues/2206
  parser.removeErrorListeners();
  parser.addErrorListener(new antlr4.error.DiagnosticErrorListener());
  parser._interp.PredictionMode =
    antlr4.atn.PredictionMode.LL_EXACT_AMBIG_DETECTION;

  parser.buildParseTrees = true;

  const tree = parser.electro_grammar();
  const listener = new ElectroGrammarToObjectListener();
  const walker = antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);
  return listener.obj;
}

module.exports = {parse};
