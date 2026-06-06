---
name: code-review
description: Get AI-powered code review feedback. Paste a diff or snippet and receive actionable, concise review comments.
tags:
  - development
  - quality
---

# Code Review

## Goal
Provide fast, actionable code review feedback on diffs or snippets.

## Instructions for AI
1. Read the code or diff thoroughly.
2. Flag bugs, security issues, performance problems, and style inconsistencies.
3. Suggest concrete fixes, not vague advice.
4. Be concise — one line per issue: location, problem, fix.
5. Skip nitpicks that don't affect correctness or maintainability.

## Example Prompt
> "Review this PR: [paste diff]. It adds a new API endpoint for user settings."

## Output
A numbered list of review comments, each with file/line, problem description, and suggested fix.
