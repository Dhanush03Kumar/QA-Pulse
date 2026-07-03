**Add your own guidelines here**
<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.

For example:
* Use base font-size of 15px
* Date formats should always be in the format "Jun 10"
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices, or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose: Used for the main action in a section or page
  * Visual Style: bg-primary text-primary-foreground hover:bg-primary/90
* Secondary Button
  * Purpose: Used for alternative or supporting actions
  * Visual Style: bg-secondary text-secondary-foreground hover:bg-secondary/80
* Destructive Button
  * Purpose: Used for destructive actions
  * Visual Style: bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60
* Outline Button
  * Purpose: Secondary button with less visual weight
  * Visual Style: border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50
* Ghost Button
  * Purpose: Minimal emphasis button
  * Visual Style: hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50
* Link Button
  * Purpose: Textual link styled as button
  * Visual Style: text-primary underline-offset-4 hover:underline

### Sizes
* Default: h-9 px-4 py-2 has-[>svg]:px-3
* Small: h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5
* Large: h-10 rounded-md px-6 has-[>svg]:px-4
* Icon: size-9 rounded-md

### Design Tokens
* Font size --font-size: 15px
* Font weights: --font-weight-medium: 500, --font-weight-normal: 400
* Border radius --radius: 0.75rem (sm: calc(var(--radius) - 4px), md: calc(var(--radius) - 2px), lg: var(--radius), xl: calc(var(--radius) + 4px))
* Colors (light/dark):
  - Background: #f8fafc / #0b0e16
  - Foreground: #0f172a / #e2e8f0
  - Card: #ffffff / #111827
  - Card foreground: #0f172a / #e2e8f0
  - Popover: #ffffff / #111827
  - Popover foreground: #0f172a / #e2e8f0
  - Primary: #6366f1 / #6366f1
  - Primary foreground: #ffffff / #ffffff
  - Secondary: #f1f5f9 / #1e2535
  - Secondary foreground: #0f172a / #e2e8f0
  - Muted: #f1f5f9 / #1e2535
  - Muted foreground: #64748b / #64748b
  - Accent: #f1f5f9 / #1e2535
  - Accent foreground: #0f172a / #e2e8f0
  - Destructive: #ef4444 / #ef4444
  - Destructive foreground: #ffffff / #ffffff
  - Border: rgba(15,23,42,0.08) / rgba(255,255,255,0.07)
  - Input: transparent / #1e2535
  - Input background: #f1f5f9 / #1e2535
  - Switch background: #cbd5e1 / #334155
  - Ring: #6366f1 / #6366f1
  - Sidebar: #f1f5f9 / #0d1220
  - Sidebar foreground: #0f172a / #e2e8f0
  - Sidebar primary: #6366f1 / #6366f1
  - Sidebar primary foreground: #ffffff / #ffffff
  - Sidebar accent: #e2e8f0 / #1e2535
  - Sidebar accent foreground: #0f172a / #e2e8f0
  - Sidebar border: rgba(15,23,42,0.08) / rgba(255,255,255,0.07)
  - Sidebar ring: #6366f1 / #6366f1

-->