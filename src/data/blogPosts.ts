export const posts = [
    {
        id: 4,
        title: 'Vibe Coding My Way Into 2026',
        date: 'Dec 23, 2025',
        content: `_Ah, computers! Such intelligent creatures…_

Going into the new year, and I mean really _going into it_ with that strange January cocktail of ambition, mild panic, and an overactive sense of possibility, I realized I wanted to revamp my personal portfolio website for 2026. Not refresh it. Not “iterate” on it. Revamp it in the biblical sense. Burn it down conceptually and rebuild something that actually sounded like me when it spoke.

The old site wasn’t wrong, exactly. It just wasn’t telling the whole truth anymore. It functioned. It was legible. It behaved. But it felt like it was introducing me the way a LinkedIn headline introduces a human being: technically accurate, emotionally vacant. And once I noticed that disconnect, I couldn’t unsee it. A personal site that doesn’t reflect how you think is worse than no site at all. It’s a polite lie.

So I rebuilt it. Conceptually first, obsessively second, and yes—_vibe coded_ the implementation. The result is zachbohl.com. Everything on it is my brainchild. The ideas, the tone, the aesthetic posture, the pacing, the deliberate friction, the moments of playfulness that threaten to undermine seriousness but never quite do. That’s all me. The code is the instrument. I’m the composer.  

And before we go any further, I should also say this plainly, because honesty is sort of the throughline here: **I used ChatGPT to help write this blog post too.** That wasn’t an accident, and it wasn’t laziness. It was consistency. This entire project is about authorship as direction, not martyrdom through manual execution. I know what I want to say. I know how I want it to sound. ChatGPT helps me tune the signal. I still decide when it’s right.

That same philosophy applied to the site itself. Vibe coding, as I practice it, is not abdication of thought. It’s the opposite. It requires you to be _more_ opinionated, not less. When the friction of implementation drops, the only thing left to judge is the quality of the idea. You can’t hide behind effort anymore. Either the thing has a soul, or it doesn’t.

Before anything was built, I knew how I wanted the site to feel. That part took hours. Actual hours of concentrated calibration. Not coding hours—thinking hours. Sitting there adjusting tone in my head. Deciding how confident is too confident, how playful is too playful, how much technicality signals competence without tipping into performative cleverness. That’s the work people don’t see, because it doesn’t leave fingerprints. But it’s the part that matters most.

Aesthetically, I landed on retro-futurism, but not the lazy, neon-synthwave caricature of it. I wanted something closer to optimism-with-edges. A future imagined by people who still believed computers might help us become more interesting, not just more optimized. Chunky interfaces. Bold typography. Motion that feels intentional instead of ornamental. A site that looks like it has opinions and isn’t afraid to express them.

I’ll say this openly: **I drew inspiration from poolsuite.net.** Not in a copy-paste sense, but in the way that good art reminds you what’s possible. Poolsuite understands something fundamental about software and joy, about interfaces that feel alive instead of purely transactional. That gave me permission to lean into personality instead of sanding it down.

Structurally, the site is not optimized for skimming. That’s deliberate. It’s paced. It asks you to linger. I wanted the experience of moving through it to mirror how I approach problems: slowly enough to notice details, fast enough not to bore myself. There are no purely decorative choices. Even the moments of friction are part of the conversation.  

One of my favorite features—and I say this with zero irony—is the **sun and moon cycle that changes based on your system time**. That little detail gives me an unreasonable amount of joy. It’s subtle, but it makes the site feel aware of the world it lives in. Morning feels different from night. Interfaces should acknowledge time. Computers are temporal creatures, after all.

Another feature I love, even though it’s still very much a work in progress, is the **community paint area**. The idea that people can come together and collectively use something like MS Paint on my website scratches a very specific itch in my brain. It’s playful, a little chaotic, and deeply internet-native. It’s not done yet, but that’s okay. I like that it’s becoming rather than finished. So am I.

The music on the site is original, and that’s important to me. None of it is AI-generated. I care a lot about creative authorship, even when I’m happy to use tools to assist execution. Music, especially, still feels like a place where human intention should remain unmistakable. The site sounds like me because it is me, in that sense too.

All of this, incidentally, is happening while I am fully aware that I “should” be studying cybersecurity certifications. That thought hovers over most of my creative work like a benevolent but judgmental ghost. But I’ve learned not to fight that tension. The urge to build expressive systems and the discipline required to secure them are not opposites. They’re part of the same mind. One feeds the other, whether I like it or not.  

There’s been a lot of anxious discourse lately about authorship in the age of AI, about whether something “counts” if you didn’t personally grind through every mechanical step. I think that anxiety misses the point. Authorship has always been about intent, taste, and responsibility. This site reflects my intent. It reflects my taste. It reflects my willingness to say, publicly, this is how I think right now.

The theme of this entire project was captured accidentally in something I once posted on X while waiting for Antigravity to do my bidding:  

> **“Ah, computers! Such intelligent creatures…”**

I meant it half-jokingly at the time, but it’s grown into something more sincere. Computers are strange collaborators. They amplify us. They expose us. They reflect our thinking back at us, sometimes uncomfortably clearly.

This website is a conversation with those creatures. A record of how I’m thinking as we head into 2026. It’s not final. It’s not precious. But after hours of calibration, iteration, rejection, and refinement, I can say this with confidence: **I’m really pleased with the outcome.**

The plumbing is modern. The tools are powerful. The thinking is mine. And for now, at least, it feels honest.

--Zach Bohl (via ChatGPT), Tuesday, December 23, 2025`
    },
    {
        id: 1,
        title: 'Hello, Quantum World — My First Steps with IBM Quantum & Qiskit',
        date: 'Oct 14, 2025',
        content: `## Introduction

I recently followed IBM Quantum's "Hello world" tutorial and got my hands dirty with qubits, entanglement, and the real challenges of running circuits on quantum hardware. In this post I'll walk through what I learned, show code snippets, and reflect on what surprised me (and what I'm excited to try next).

## Setting the Stage

To get started, I set up a Python environment (Jupyter) with Qiskit, qiskit‑ibm-runtime, and matplotlib. I also configured my IBM Quantum credentials so that I could submit jobs to real quantum processors via IBM Cloud.

This setup might seem boilerplate, but it's crucial: quantum frameworks depend heavily on proper versions, backend connectivity, and visualization tools.

## The Four Phases of a Quantum Program

One of the most useful mental models I picked up from the tutorial is that any quantum program (in this Qiskit + IBM runtime setting) can be thought of in four phases:

* Map — translate your problem into circuits and operators
* Optimize — adapt circuits to hardware constraints, reduce depth, map layouts
* Execute — send the job to a simulator or QPU using primitives like Estimator or Sampler
* Analyze — interpret results, plot, use error mitigation

This "pipeline" abstraction is helpful: any nontrivial quantum algorithm you write later will go through these phases.

## A Toy Example: Bell State + Observables

To test things out, I constructed this simple circuit:

\`\`\`python
from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.draw("mpl")
\`\`\`

This prepares a Bell entangled state between qubits 0 and 1.

Next, I defined a few observables (Pauli operators) using \`SparsePauliOp\`: \`IZ\`, \`IX\`, \`ZI\`, \`XI\`, \`ZZ\`, \`XX\`.

These capture single‑qubit measurements and correlations. The expectation values of these observables will tell me whether the qubits behave independently or are correlated (entangled).

For execution, I used:

\`\`\`python
from qiskit_ibm_runtime import EstimatorV2 as Estimator
estimator = Estimator(mode=backend)
estimator.options.resilience_level = 1
estimator.options.default_shots = 5000
job = estimator.run([(isa_circuit, mapped_observables)])
\`\`\`

## Scaling Up: GHZ States and the Noise Problem

After verifying things on 2 qubits, the tutorial scales to 100 qubits by preparing a GHZ state:

\`\`\`python
def get_qc_for_n_qubit_GHZ_state(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for i in range(n - 1):
        qc.cx(i, i+1)
    return qc
\`\`\`

## What Surprised Me & Lessons Learned

* The sheer difference between ideal outcomes and real hardware outputs is humbling.
* The optimization / mapping stage is not cosmetic — it's essential.
* Scaling is brutal. The decay of correlations is a real-world symptom of quantum fragility.

## What's Next For Me

* Dive deeper into error mitigation techniques.
* Try VQE (Variational Quantum Eigensolver) or QAOA.
* Experiment with hybrid quantum-classical workflows.`
    },
    {
        id: 2,
        title: 'Revisiting The Brothers Karamazov at 30',
        date: 'Jul 23, 2025',
        content: `Ten years ago, at the age of 20, I cracked open one of the finest works of literature humanity has ever produced. Did I understand it? Will I understand it now?

*The Brothers Karamazov* by Fyodor Dostoevsky is a beast. 900 pages of Russian philosophy wrestling with faith, evil, family, and murder. I remember sitting in a diner at 1 AM reading Ivan's conversation with the devil. The dread was palpable.

Did I get it then? I'm not sure. I've always "struggled with faith." I've dabbled in other traditions like Hinduism, but it never quite clicked. 

This isn't about fishing for faith; it's a retrospective. I don't remember much of the plot, but I remember the feeling. Back in my late teens, I was a Dostoevsky fan before it was a cliché. Now at 30, after a bumpy ten years, I'm wondering what else the book has to say.

Life threw some wild stuff at me—heartbreaking and hilarious. A retrospective at 30 might seem gauche, but I just want to make cool shit for my bros. 

So, what are you reading? Me? I'm reading Dostoevsky. Again.`
    },
    {
        id: 3,
        title: 'From Quantum Math to Synth Knobs: A Strange Journey Through Brains, Qubits, and Sound',
        date: 'Jan 20, 2025',
        content: `It all started with a simple question: how do you make giant language models faster?

Engineers have found clever ways to trim them down. Quantization shrinks brains into 8-bit or 4-bit. Speculative decoding lets a small "draft model" write ahead. It's all about shaving milliseconds off billions of calculations.

## The Quantum Detour

Qubits live in superpositions, balancing yes and no at the same time. The HHL algorithm promises to solve linear systems exponentially faster, which is at the heart of neural nets. But preparing data is slow, and hardware is noisy. For now, it's a glowing lighthouse on the horizon.

## Kernels, Overlaps, and Attention

In classical ML, kernels are shortcuts for measuring similarity. Quantum systems can encode information as states and perform an overlap test:

\`\`\`
k(x, y) = | <phi(x) | phi(y)> |²
\`\`\`

This looks a lot like what transformers already do with attention. The gap between transformers and quantum algorithms may be smaller than it seems.

## Where Music Sneaks In

Every instrument has an acoustic fingerprint. Could we replace serial numbers with sound tests? Synthesizers like Serum are universes of wavetables and knobs. In theory, you could work backwards from a track to the preset using phase-sensitive overlaps.

## What Ties It All Together

The theme is fingerprints:

* Matrices have eigenvalue fingerprints.
* Attention layers compute similarity fingerprints.
* Instruments carry timbral fingerprints.
* Synth patches hide behind parameter fingerprints.

Whether it's GPUs or qubits, the puzzle is always about identifying the hidden signature in a sea of noise.`
    }
];
