// Everything Pio changes: sections of the blocking, the cast and the running order.
// Loaded before app.js; these globals are read there.

// Beats before the run-in that the lines leave the wings (4 = on count 1 of the last guitar bar)
const RUN_LEAD=4;

// mid: a caption shown under the main tag for its beats each time the lines' leaders reach centre
// last: a tag shown instead of the main tag for the section's closing beats
const SECTIONS=[
  {id:"pio",name:"Count in - Pio dies",desc:"One bar count-in; Pio is already at front centre, dies and doesn’t move",beats:4,tag:"Count in - Pio dies"},
  {id:"cue",name:"Guitar picks up",desc:"Cue to prepare; Pio stays dead, everyone ready in the wings",beats:8,last:{beats:RUN_LEAD,tag:"Start moving towards centre"},tag:"Cue to prepare – guitar picks up"},
  {id:"travel",name:"Run in & cross",desc:"Run in single file, split into 2 lines, cross edge to edge in shape (slowest in the middle)",beats:32,tag:"Move edge to edge",mid:{beats:4,tag:"Strike shape low/high close to the middle"}},
  {id:"slow1",name:"Slow down",desc:"Keep travelling, slowing to a stop",beats:4,tag:"Slow down"},
  {id:"freeze1",name:"Freeze",desc:"Hold the shape",beats:4,fz:1,tag:"Freeze"},
  {id:"slow2",name:"Slow down, look",desc:"Move again, slowing to a stop, looking out at the audience",beats:4,tag:"Slow down, look at audience"},
  {id:"freeze2",name:"Freeze",desc:"Hold the shape",beats:4,fz:1,tag:"Freeze"},
  {id:"bow",name:"Line",desc:"Form one line at the back, by the stage",beats:16,tag:"Form the line"}
];

const RIGHT=[["Duncan","H",1],["Jaska","L"],["Dasha","H"],["Cesar","L"],["Iris","H"],["Lilith","L"],["Dawid","H"],["Sammi","L"]];
const LEFT=[["Luna","H",1],["Cody","L"],["Keto","H"],["Tal","L"],["Sunshine","H"],["Kim","L"],["Cassie","H"]];

// Running order: [song time in seconds, section, lines]. A line can be {cue, do:[...]}:
// cue is the first few words of the lyric only (never full lyric lines), do is what happens on it.
const ORDER=[
 [0,"Intro",["go in"]],
 [6,"Drums",["go in"]],
 [16,"Verse",["Scientist teases me with fire stick for fun to entertain the audience","We always jitter on a 1st bot bit of the line","Changing the who is winning and who is scared and crawling back",
   {cue:"The, the, the",do:["scientists hits the stage and yells to wakeup the creature"]},
   {cue:"Drugs, they say",do:["creature jumps out","the scientist backs up"]},
   {cue:"We love in vain",do:["the roles turn now the scientist leaps at creature with stick and creature backs down"]},
   {cue:"The cops and queers",do:["creature goes around and role change - scientist is scared and backs down"]},
   {cue:"Hate today",do:["scientist leaps fast at creature and creature falls on the back and crawls in a crab"]}]],
 [32,"Verse",[]],
 [37,"Chorus",["We both turn towards audience and slow down, show teeth, bit creepy, movement more fluid but out of alignment"]],
 [48,"Chorus",["I stand up - release the chain or something","Scientist looks at me scared screaming and drops the stuff, does 180deg turn, runs into the wall, bounces off, collects himself and keeps running in panic","I grab a staff put it in my neck crawl a bit aiming at audience and leapt at them"]],
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

// Things to keep in mind, shown under the timeline
const NOTES=[
 "First shape (high or low) happens in the middle: run towards centre, and the first person strikes their shape just behind the middle. Dont start with a shape. After that, free flow side to side.",
 "Move on the beat - Adjust your pace to the beat. Keep the beat in your head the whole time."
];
