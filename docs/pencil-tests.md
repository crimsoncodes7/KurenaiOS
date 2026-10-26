# Testing the Apple Pencil Pro (step by step)

Written 26 October 2026, the day the Pencil Pro arrived. It assumes you
have never used one. It runs the plan's three device tests
([ipad-plan.md](ipad-plan.md) §6): P (the pen), D (documents) and H
(handwriting). Each part ends with what to tell Claude. Allow about
45 minutes for all of it, or do one part at a time.

## 0. Getting the Pencil going (5 minutes)

1. **Charge and pair it in one go.** Hold the iPad in landscape, with
   the camera at the top. Put the Pencil flat on the **top edge**, where
   the magnet pulls it in. A card pops up saying "Apple Pencil" with
   **Connect**. Tap it. That's the whole pairing. It charges while it's
   stuck there, so leave it there whenever you're not using it.
2. **Hold it like a normal pen.** The flat side doesn't matter. You
   can rest your hand on the glass while you write; the iPad ignores
   your palm.
3. **Things the Pencil Pro does by itself** (try them, but the app
   doesn't use them, because Safari never tells a web page about them):
   - **Squeeze** the lower part, where your fingers hold it: in Notes it
     opens a tool menu.
   - **Double-tap** the side with a finger: in Notes it swaps pen and
     eraser.
   - **Hover:** hold the tip just above the glass and a shadow of the
     tip appears.
   - **Scribble:** write with the Pencil inside any text box (Safari's
     address bar, or the app's search) and it turns into typed text.
     Scratch a word out to delete it.
4. **Open KurenaiOS** from its Home Screen icon (not a Safari tab). If a
   box says **Update ready**, tap **Reload now**. You want the version
   from today.

## Test P: the pen (15 minutes)

What we're checking: the app knows it's a pen, your palm never draws,
and the ink keeps up with you.

1. Go to any topic. For example: Study › Computer Science › any topic.
   Tap the **Handwritten** tab. A blank page appears with tools along the
   top.
2. **Write a line** with the Pencil: your name, a sentence, anything.
   - Does the ink appear under the tip as you go, or trail behind it?
   - Press harder, then lighter. Does the line get thicker and thinner?
     It should with the Pencil Pro.
3. **Palm test.** Write a whole paragraph (five lines or so) with your
   hand resting on the glass the way it would on paper. Then look for
   stray marks where your palm was. There should be none.
4. **Finger test.** Drag one finger up the page: it should **scroll**,
   not draw. Pinch with two fingers: it should zoom.
5. **Undo test.** Tap the glass with **two fingers at once**, quickly,
   like a double click. Your last stroke should vanish. Then pinch to
   zoom a few times: a pinch should never undo anything.
6. **The tools,** along the top bar. Tap each one, then try it:
   - **Pen:** writes.
   - **Highlight:** goes *under* the ink, like a real highlighter.
   - **Eraser:** rubs out what it touches. Tap the eraser again to
     switch to "Whole stroke", which removes a whole line at once.
   - **Lasso:** draw a loop round some words, then move them.
   - **Shape:** draw a rough circle and *hold the tip still* at the
     end. It snaps into a clean circle. Try a line and a box too.
   - **Ruler:** a straight edge appears that you can draw along.
7. **Keep writing past the bottom** of the page: a page 2 should appear
   by itself.
8. Go to **Archive › Pen and ink**. The "Your pen" card should say
   **Working** and "It reports pressure, so the width follows it."

**Tell Claude:**
- what the Pen and ink card says;
- whether the ink trailed behind;
- any stray palm marks;
- whether a pinch ever undid something;
- anything that felt wrong or slow.

## Test D: a whole past paper (10 minutes)

What we're checking: a 30-page PDF opens quickly, scrolls smoothly and
takes ink.

1. **Get a paper onto the iPad.** On the Mac, open
   `~/Downloads/A-level` and pick one long paper, for example a CS
   Paper 2 question paper. Right-click it › Share › **AirDrop** › your
   iPad. On the iPad it lands in the Files app, in Downloads.
2. In KurenaiOS go to **Archive › Files**. Tap **⇪ Add files** and pick
   the paper from Downloads.
3. Tap the paper to open it. Count roughly how long the first page
   takes to show (one second is the target).
4. **Scroll quickly to the last page and back.** Watch for blank pages
   that stay blank, stutters, or the app reloading itself. A reload is
   the thing we most need to know about.
5. **Write on it.** With the Pencil, answer part of a question in the
   margin. Scroll away and back: your ink should still be there.
6. Open the **⋯** menu on the viewer and try **Ask Kurenai about this
   page**. It shows you what will be sent before anything goes.
7. (Optional) Back in Files, tap **◫ Scan pages**, photograph a page of
   your own notes, drag the four corners to the page's corners, and
   straighten it. It becomes a PDF.

**Tell Claude:**
- how long the first page took;
- whether scrolling stuttered;
- whether the app ever reloaded;
- whether your ink stayed put.

## Test H: does Kurenai read your Maths? (20 minutes)

What we're checking: whether Kurenai marks your handwritten working well
enough to trust. The bar is that it agrees with you on 9 of 10
decisions, and never gives an A mark without its M mark.

1. **Turn it on.** Go to **Archive › Pen and ink** and turn on
   **Kurenai reads handwriting when asked**. You need to be signed in to
   cloud sync. It's off again with the same switch, and nothing is ever
   read unless you press a button.
2. Go to a **Maths** topic you know, and open its **Exam** tab.
3. Under a question, choose **Write** (instead of Type) and work the
   answer out by hand, as you would in the exam.
4. **Mark it yourself first.** Open **Mark scheme · self-mark** and tick
   the marks you think you earned. Write your score on paper.
5. **Then** press **Mark with Kurenai**. It first shows exactly what
   will be sent (a picture of your working and the question). Send it.
6. Compare its marks with yours, mark point by mark point. It only
   suggests: nothing changes until you confirm.
7. Do this for **10 answers**, with some mistakes on purpose in two or
   three of them, so we see whether it catches them.
8. (Optional) On any topic page, the **✎ Working** button opens squared
   paper beside the page. Write some working, then press **Check my
   working**.

**Tell Claude, for each of the 10:**
- your marks and Kurenai's marks;
- any time it gave an A mark without the M mark;
- any time it misread your writing (a 5 read as an S, a minus sign
  missed, and so on).

## If something goes wrong

- **The ink doesn't appear at all:** check Pen and ink. If it says "No
  pen yet", the app isn't seeing a pen. Turn on **Draw with a finger**
  so you can carry on, and tell Claude.
- **The Pencil stops working:** stick it back on the top edge for a
  minute (it may be flat), or check Settings › Apple Pencil.
- **A page looks broken:** take a screenshot (press the top button and
  volume up together) and send it over.
