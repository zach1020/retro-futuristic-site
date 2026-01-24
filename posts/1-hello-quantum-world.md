---
id: 1
title: "Hello, Quantum World — My First Steps with IBM Quantum & Qiskit"
date: "Oct 14, 2025"
---
## Introduction

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
* Experiment with hybrid quantum-classical workflows.
