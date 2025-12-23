import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';

const posts = [
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

export const BlogApp: React.FC = () => {
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    const selectedPost = posts.find(p => p.id === selectedPostId);

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            color: 'inherit'
        }}>
            <div style={{
                backgroundColor: '#e0e0e0',
                borderBottom: '1px solid currentColor',
                color: '#000', // Keep chrome text black for contrast against gray chrome
                padding: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'Chicago, Geneva, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <span>Netscape Blog Reader 1.0</span>
                {selectedPost && (
                    <button
                        onClick={() => setSelectedPostId(null)}
                        style={{
                            border: '1px solid #000',
                            backgroundColor: '#c0c0c0',
                            padding: '2px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '1px 1px 0 #fff inset, -1px -1px 0 #888 inset'
                        }}
                    >
                        <ArrowLeft size={10} /> Back to List
                    </button>
                )}
            </div>

            <div className="retro-scrollbar" style={{
                padding: '20px',
                overflowY: 'scroll',
                flex: 1,
                fontFamily: 'Times New Roman, serif',
                lineHeight: '1.6',
                userSelect: 'text',
                cursor: 'text'
            }}>
                {selectedPostId === null ? (
                    // Menu View
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {posts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => setSelectedPostId(post.id)}
                                style={{
                                    border: '1px solid currentColor',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent
                                    boxShadow: '2px 2px 0 currentColor',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--win-title-bg)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.color = 'inherit';
                                }}
                            >
                                <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>{post.date}</div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{post.title}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Post View
                    selectedPost && (
                        <article style={{ borderBottom: '2px solid currentColor', paddingBottom: '20px' }}>
                            <h1 style={{
                                fontSize: '24px',
                                margin: '0 0 10px 0',
                                fontFamily: 'Arial, Helvetica, sans-serif'
                            }}>
                                {selectedPost.title}
                            </h1>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '20px',
                                fontStyle: 'italic'
                            }}>
                                {selectedPost.date}
                            </div>
                            <div className="markdown-content">
                                <ReactMarkdown
                                    components={{
                                        h2: ({ node, ...props }) => <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #ddd' }} {...props} />,
                                        p: ({ node, ...props }) => <p style={{ marginBottom: '15px' }} {...props} />,
                                        ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', marginBottom: '15px' }} {...props} />,
                                        li: ({ node, ...props }) => <li style={{ marginBottom: '5px' }} {...props} />,
                                        code: ({ node, ...props }) => {
                                            const isInline = !props.className && String(props.children).indexOf('\n') === -1;
                                            return isInline
                                                ? <code style={{ backgroundColor: '#eee', padding: '2px 4px', fontFamily: 'monospace' }} {...props} />
                                                : <code style={{ display: 'block', backgroundColor: '#eee', padding: '10px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: '10px 0' }} {...props} />;
                                        },
                                        pre: ({ node, ...props }) => <pre style={{ margin: 0 }} {...props} />,
                                        a: ({ node, ...props }) => <a style={{ color: 'blue', textDecoration: 'underline' }} {...props} />
                                    }}
                                >
                                    {selectedPost.content}
                                </ReactMarkdown>
                            </div>
                        </article>
                    )
                )}
            </div>
        </div >
    );
};
