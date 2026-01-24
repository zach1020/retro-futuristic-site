---
id: 8
title: "Building PodSkip: A Dream Six Years in the Making"
date: "Jan 24, 2026"
---
# Building PodSkip: A Dream Six Years in the Making

## The Idea That Wouldn't Leave Me Alone

I've wanted to build PodSkip since 2018.

Back then, I was deep into podcasts — commuting, working out, doing dishes, whatever. And every single time, without fail, I'd be locked into some fascinating conversation about technology or philosophy or whatever, and then suddenly: "This episode is brought to you by—"

And I'd fumble for my phone. Try to hit the 30-second skip. Overshoot. Go back. Undershoot. Miss the first sentence of actual content. Repeat three more times per episode.

It drove me insane.

I remember thinking: "There has to be a way to automate this. The ads sound *different*. They have a different cadence, different production quality, different energy. A computer should be able to figure this out."

But in 2018? The tech just wasn't there. Not for a solo developer without a machine learning research team and a massive dataset. Speech-to-text was clunky and expensive. Running inference was slow. The idea went into my mental backlog — that graveyard of "someday" projects that every developer has.

## Fast Forward to Now

Here's the thing about technology: it moves fast, and sometimes it moves in exactly the direction you were hoping for.

Over the past couple years, AI has gotten absurdly good at transcription. We're talking fast, cheap, and accurate. Cloud APIs can process an hour-long podcast episode in seconds. And large language models have gotten genuinely good at understanding context — at recognizing when someone shifts from "authentic conversation" to "reading ad copy."

I realized that the project I couldn't build in 2018 was suddenly... buildable.

So I built it.

## What PodSkip Actually Does

The core idea is simple: you paste a podcast RSS feed, pick an episode, and hit play. Behind the scenes, PodSkip:

1. Downloads the episode audio
2. Sends it through a cloud transcription service
3. Analyzes the transcript to detect ad segments
4. Marks those timestamps
5. Automatically mutes the audio when you hit an ad during playback

No manual skipping. No fumbling for your phone. Just seamless listening.

For Pro users, you can also download ad-free MP3s — the ads get stripped out entirely, and you get a clean file to listen to offline however you want.

## The Vibe-Coding Experience

I'm going to be real with you: I vibe-coded a lot of this with Claude Code.

If you're not familiar with the term, "vibe-coding" is basically when you describe what you want to build in natural language and let an AI help you write the code. You iterate fast, you don't get bogged down in boilerplate, and you can focus on the actual product instead of fighting with syntax.

Was it a perfectly architected codebase from day one? Absolutely not. Did I ship something that works and that people can actually use? Yes.

I've spent a lot of my career worrying about whether I'm a "real" programmer, whether I understand things deeply enough, whether I'm relying too much on tools and abstractions. And honestly? Building PodSkip helped me let go of some of that. The goal was never to prove I could write everything from scratch. The goal was to make something useful. Claude Code helped me do that faster than I ever could have alone.

The future of software development is collaborative — humans and AI working together. I'm here for it.

## The Challenges (Because Of Course There Were Challenges)

This project wasn't just smooth sailing. A few things that made me want to throw my laptop out the window:

**Pre-roll ads are sneaky.** Some podcasts start with an ad before any content. Detecting those required different logic because there's no "transition" to detect — you're just dropped straight into an ad read.

**Dynamic ad insertion is a thing.** A lot of podcasts now have ads that are inserted dynamically, which means the same episode might have different ads depending on when and where you download it. The timestamps can shift. The ads can change. It's chaos.

**Accuracy is hard.** Getting to 94% accuracy sounds good until you realize that 6% of the time, you're either muting real content or letting ads through. Both feel bad. I spent a lot of time tuning the detection to minimize false positives while still catching the sneaky ads.

**Audio processing is its own beast.** Dealing with different bitrates, formats, encoding issues, and making sure the web player handles everything smoothly — that's a whole skill set I had to level up on.

But that's the fun part, right? Solving problems you've never solved before. Learning things you didn't know you needed to learn.

## Why This Matters to Me

I've always believed that AI should make people's lives easier in tangible, everyday ways.

Not just "AI will revolutionize industries" in some abstract sense. I mean: AI should save you from the small annoyances. The friction. The tedious stuff that adds up over time.

Muting podcast ads isn't going to change the world. But it might make your commute a little better. It might let you stay in flow during a workout. It might give you back a few minutes of your day that would otherwise be spent fumbling with skip buttons.

That's the kind of AI application I care about. Practical. Human-centered. Actually useful.

And honestly? I'm just super gassed that current technology makes this possible. Six years ago, this was a pipe dream. Now it's a real thing that real people can use. That feels incredible.

## What's Next

PodSkip works for audio podcasts right now, but I'm already thinking about what's next:

**Video podcasts.** YouTube, Spotify video, all of that. The same fundamental problem exists — ads interrupting content — and the same solution should apply. Detect the ad segments, skip or mute them, let people watch in peace.

**Videos in general.** Why stop at podcasts? Long-form YouTube content, lectures, conference talks — anything with mid-roll ads could benefit from this kind of automatic detection.

I'm not sure exactly what the roadmap looks like yet, but the foundation is there. The hard part — accurate ad detection — is solved (or at least solved enough). Extending it to new formats is mostly an engineering problem.

## Try It Out

If you're a podcast listener who's ever been annoyed by ads, I'd love for you to give PodSkip a try.

The free tier gives you 3 episodes per month — enough to see if it works for the shows you listen to. If you like it, Pro is $4.99/month for 30 episodes plus the ad-free MP3 downloads.

**[podskip.lol](https://podskip.lol)**

And if you have feedback — things that don't work, features you want, ads that got missed — I genuinely want to hear it. This is a passion project, and I'm building it for people like me who just want to enjoy their podcasts without interruption.

Thanks for reading. And thanks for letting me share something I've wanted to build for a really, really long time.

- Zach
