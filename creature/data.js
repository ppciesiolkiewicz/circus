// Everything Pio changes: sections of the blocking, the cast and the running order.
// Loaded before app.js; these globals are read there.

// On every strike (count 1 as the lines meet mid-stage) the leaders crossed the middle this many beats before,
// so about 2 people of each line are past the middle and 2 still to come. The run-in times itself from this.
const LEAD_PAST=1;
// Pickup: how many beats before the 2nd bar of "Guitar picks up" everyone leaves the wings
// (2 = on the 3 of the 1st bar). The default; the "Start before" switch next to Play changes it (0, 1 or 2).
const PICKUP_BEATS=2;

// mid: a tag shown instead of the main tag for its beats each time the lines' leaders reach centre
// last: a tag shown instead of the main tag for the section's closing beats ("pickup" = from when they leave the wings)
// note: a smaller caption under the tag, for the whole section (or only its closing `beats`, if given)
const SECTIONS=[
  {id:"pio",name:"Count in - Pio dies",desc:"One bar count-in; Pio is already at front centre, dies and doesn’t move",beats:4,tag:"Count in - Pio dies"},
  {id:"cue",name:"Guitar picks up",desc:"Cue to prepare; Pio stays dead, everyone ready in the wings",beats:8,last:{beats:"pickup",tag:"Start moving towards centre"},tag:"Cue to prepare – guitar picks up",note:{text:"We can start running a beat or two before “There’s lots of pretty”, so it’s easier to cross the stage (TBC)."}},
  {id:"travel",name:"Run in & cross",desc:"Run in single file, split into 2 lines, cross edge to edge in shape (slowest in the middle)",beats:32,tag:"Move side to side",mid:{beats:4,tag:"Strike shape low/high on 1st beat"}},
  {id:"slow1",name:"Slow down",desc:"Keep travelling, slowing to a stop",beats:4,tag:"Slow down"},
  {id:"freeze1",name:"Freeze",desc:"Hold the shape",beats:4,fz:1,tag:"Freeze - strike a scary pose"},
  {id:"slow2",name:"Slow down, look",desc:"Move again, slowing to a stop, looking out at the audience",beats:4,tag:"Slow down, look at audience"},
  {id:"freeze2",name:"Freeze",desc:"Hold the shape",beats:4,fz:1,tag:"Freeze - strike a scary pose"},
  {id:"bow",name:"Line",desc:"Form one line at the back, by the stage",beats:17,tag:"Form the line for bow"},
  {id:"pose",name:"Pose",desc:"Strike a pose on count 2 of the last bar, just as the song is finishing",beats:4,fz:1,tag:"Strike a pose"}
];

const RIGHT=[["Duncan","H",1],["Jaska","L"],["Dasha","H"],["Cesar","L"],["Iris","H"],["Lilith","L"],["Dawid","H"],["Sammi","L"]];
const LEFT=[["Luna","H",1],["Cody","L"],["Keto","H"],["Tal","L"],["Sunshine","H"],["Kim","L"],["Cassie","H"]];

// Running order: [song time in seconds, section, lines]. A line can be {cue, do:[...]}:
// cue is the first few words of the lyric only (never full lyric lines), do is what happens on it.
const ORDER=[
 [0,"Intro",["scientists goes in"]],
 [6,"Drums",["scientist lights up a fire staff"]],
 [16,"Verse",[{cue:"The, the, the",do:["scientists hits the stage and yells to wakeup the creature"]},
   {cue:"Drugs, they say",do:["creature jumps out","the scientist backs up"]},
   {cue:"We love in vain",do:["the roles turn now the scientist leaps at creature with stick and creature backs down"]},
   {cue:"The cops and queers",do:["creature goes around and role change - scientist is scared and backs down"]},
   {cue:"Hate today",do:["scientist leaps fast at creature and creature falls on the back and crawls in a crab"]}]],
 [32,"Pre-Chorus",[{cue:"We’re all stars now",do:["We both turn towards audience and slow down, show teeth, bit creepy but fluid movement"]}]],
 [37,"Chorus",[{cue:"There’s lots of pretty",do:["I stand up - release the chain or something","Scientist looks at me scared screaming and drops the stuff, does 180deg turn, runs into the wall, bounces off, collects himself and keeps running in panic","I grab a staff put it in my neck crawl a bit aiming at audience and leapt at them"]}]],
 [48,"Post-Chorus",[{cue:"We’re all stars, now",do:[]}]],
 [69,"Chorus",["Animal crawl with staff possible in a hand across audience line"]],
 [80,"Verse",["Contemporary with a spin and jump and bit of creature landing and feel","drop"]],
 [102,"Verse",["back to crawling"]],
 [123,"Chorus",["run towards the audience and act like creature along the audience line"]],
 [143,"Music",["Creature rolls over to the middle"]],
 [156,"Verse",["Creature dies in convulsions"]],
 [177,"Chorus",["Everybody runs onto stage for both ends crossing in a middle either sliding or kicking","Scientists runs first and spills beaker content onto creature","Creature joins with everyone on the stage"]],
 [197,"Music",["slow down - we can play with lights and changing positions when the light is off couple times"]],
 [210,"Chorus",["continue Kick jumping, sliding, dancing from edge of stage to stage or something like Vanessa said that we can burn in a pile which I love too"]],
 [237,"End",[]]
];

// Things to keep in mind: [icon, short red title, text]; a plain array of strings after a point is its sub-points;
// {fig:"lines"} draws the line order (back to front) under the point above it;
// {fig:"beat"} two dots moving beat to beat, in time with the song.
// {fig:"loops"} moves the two loop animations (in index.html) under the point above it.
const NOTES=[
 ["😬","Be creepy","When slowing down and posing, be a bit scary and creepy – show your teeth."],
 ["🧭","Know yourself","Know which side you’re on and which shape you strike. If your shape needs more space (like a cartwheel), tell Duncan and Luna so we can plan for it."],
 ["🏃","Run first","Don’t start with a shape. Run towards the centre first, especially if you’re at the front of your line."],
 ["⏱️","Start before","We can start running a beat or two before “There’s lots of pretty”, so it’s easier to cross the stage (TBC)."],
  ["Know where the first beat is."],
 ["↔️","Form lines","Run towards each other and form lines as in the animation. From the stage: Duncan’s group → Luna’s group → Duncan’s group → Luna’s group."],
  {fig:"lines"},
 ["💥","First shape","The first shape (high or low) is in the middle: the first person strikes it just past the middle (about a metre past), and we all strike on the beat."],
  ["Syncing the shapes matters most at the beginning. Later it can get more free-form."],
 ["🥁","On beat","Move on the beat. Match your pace to it and keep it in your head the whole time."],
 ["🔄","Loop around","Move in a loop (see animation): Luna’s group (left) goes clockwise, Duncan’s group (right) counter-clockwise. At the side of the stage don’t make a sharp 180° turn – curve a little towards the stage/audience."],
  ["This is just so we don’t bump into each other."],
  {fig:"loops"},
 ["🎶","Beat to beat","It would be nice to move “beat to beat” (see animation below)."],
  ["That gives us 4 steps for each half of the stage. A “step” is just one push on the beat – it can be several real steps, as many as you like.",
   "Just an idea – I think it could help us avoid chaos at the start, when we run towards each other."],
  {fig:"beat"}
];
