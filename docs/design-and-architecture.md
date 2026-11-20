# Design and architecture decisions

This public companion reflects a read-only inspection of the private `cooking-ai` repository on 20 November 2026. It does not replace a full production security assessment or claim that the app's test suite was executed as part of this publication.

## 1. Conversation as interaction, not a chat transcript

The important choice was to differentiate three actions: `new_recipe`, `refinement`, and `question`.

- A **new recipe** creates a new working recipe card.
- A **refinement** changes the recipe the user was working on when the request began.
- A **question** leaves the recipe untouched and returns an informational response.

This makes the structure of the product predictable even when natural-language requests are not. The model supplies a structured action; the application decides how that action affects its interface.

## 2. Capture the card before starting an asynchronous request

A network response may arrive after the user has moved to a different recipe. The app captures the original workspace ID and recipe context before submitting the request. A refinement is applied only if that original card still exists. It is never silently redirected to whichever card is currently in view.

The small example in `src/recipe-workspace.mjs` shows this rule without copying the complete React Native UI.

## 3. Treat model output as untrusted

The real server asks for structured output with an explicit schema and validates it before returning it to the device. The device checks the response again before changing recipe state. A question must carry no recipe, whereas a new recipe or refinement must carry recipe data.

The companion's `response-contract.mjs` demonstrates the UI-facing contract. It does not pretend to replace the production server's stronger bounds, authorization checks, or database rules.

## 4. Request identity and reliability

The private app associates an idempotency key with a pending message and its target recipe workspace. A retry of that same request can preserve the identifier, while a new message or a new target gets a new identifier. The backend separately owns request reservation and completion accounting.

The public example demonstrates only the client-side identity rule. It is **not a billing or quota implementation**.

## 5. Keep API secrets server-side

The private implementation routes AI calls through a Supabase Edge Function. The mobile client uses a public Supabase key and an authenticated session; the OpenAI key and service role key are read only on the server. Those secrets and the actual project configuration are intentionally absent here.

The private Edge Function contains additional safeguards for server-side quotas, request settlement, and response validation. They are not replicated in this public illustration because lifting that code out of its database and authentication environment could mislead readers about what was actually secured.

## 6. Save and edit are different actions

Working cards can change when users refine a recipe. The local SQLite save is a separate, insert-only operation, so changing a working recipe does not quietly overwrite a saved original. The example focuses on the session and card identity rule; it does not include the production SQLite module.

## 7. Limitations worth being explicit about

- The actual `App.tsx` is large and combines several interface concerns. A modular refactor would improve maintainability, but is not represented as completed work.
- Matching excluded ingredients by words can miss aliases, cross contact and incomplete ingredient descriptions. The application is **not an allergy safety device**.
- The public code is deliberately smaller and has no live integrations. Passing its tests does not verify the production app.
- Some repository documentation in the private app is outdated, which is one reason to provide a separately curated technical companion rather than publishing the original repository wholesale.

The goal is to show what I chose to implement, what I guarded against, and where the remaining limits are, without turning a portfolio project into a pretend open-source product.
