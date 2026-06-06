---
name: create-a-resume
description: Tailor a resume PDF from your existing CV and a target job description. Give it your CV path and JD link or text, get a polished PDF back.
tags:
  - productivity
  - career
---

# Create a Resume

## Goal
Read your existing CV (PDF), compare against a job description, and produce a tailored one-page PDF resume that highlights what matters for that role.

## Usage

```
/create-a-resume

Job Description: <url or text>
CV Location: <path to your PDF>
```

- **Job Description** — a URL (the AI will fetch and extract it using browser/web tools) or paste the text directly.
- **CV Location** — local file path to your current CV in PDF format.

## Instructions for AI
1. Read the CV PDF at the given path and extract all content.
2. If a JD URL is provided, fetch and extract the job description using browser or web tools.
3. Map the CV content to the JD: identify matching skills, experience, and projects.
4. Structure the resume into: **Summary**, **Experience**, **Skills**, **Projects**.
5. Reorder and rephrase bullet points to highlight JD-relevant impact first.

## Rules
- **Keep it one page.** Cut anything not relevant to this specific role.
- **Be concise.** Use short, punchy bullet points with action verbs.
- **Impact-first.** Quantify where real numbers exist. Never invent metrics.
- **Honest, but sell.** Don't overhype or fabricate. Present genuine experience in the best light aligned to the JD.
- **Match the JD language.** Use the same terminology the job description uses (e.g., if they say "design systems", don't say "component library").

## Output
A PDF file saved next to the original CV with `-tailored` suffix (e.g., `cv-tailored.pdf`).
