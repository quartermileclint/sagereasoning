# SageReasoning: Supabase Region Migration Walkthrough

## What This Does

Moves your database from **Singapore** to **US East (North Virginia)** so it sits closer to Anthropic's API servers and your target developer audience. No cost change — you stay on the free plan.

## Before You Start

- **Time needed:** About 30-45 minutes
- **Risk level:** Low — your old project stays untouched until you're ready to switch
- **What you'll need open:** Your browser with tabs for Supabase, Vercel, and this document

---

## PHASE 1: Create the New Supabase Project

### Step 1: Go to Supabase Dashboard

1. Open your browser
2. Go to **https://supabase.com/dashboard**
3. Sign in with your existing account (the same one you use now)

### Step 2: Create a New Project

1. Click the green **"New Project"** button (top left area)
2. Fill in the form exactly like this:
   - **Name:** `sagereasoning-us` (or any name you like — this is just for your reference)
   - **Database Password:** Create a strong password and **save it somewhere safe** (you won't need it often, but don't lose it)
   - **Region:** Select **"East US (North Virginia)"** from the dropdown
   - **Plan:** Free (should be selected by default)
3. Click **"Create new project"**
4. Wait 1-2 minutes while Supabase sets up your new project

### Step 3: Write Down Your New Project Details

Once the project is created, you need three pieces of information. To find them:

1. In your new project, click **"Settings"** in the left sidebar (the gear icon near the bottom)
2. Click **"API"** under the "Configuration" section
3. You'll see a page with your keys. Copy and save these three values somewhere temporary (like a notes app):

| What to Copy | Where to Find It | Label on Page |
|---|---|---|
| **Project URL** | Top of the API page | `URL` — looks like `https://xxxxxxxx.supabase.co` |
| **Anon Key** | Under "Project API keys" | `anon` `public` — a long string starting with `eyJ...` |
| **Service Role Key** | Under "Project API keys" | `service_role` `secret` — click "Reveal" to see it, another long `eyJ...` string |

**Keep these handy — you'll need them in Phase 3.**

---

## PHASE 2: Set Up the Database Tables

Now you need to run SQL commands to create all your tables in the new project. This is like building the rooms in a new house — same layout, just a different address.

### Step 4: Open the SQL Editor

1. In your **new** Supabase project (make sure you're in the new one, not the old Singapore one!)
2. Click **"SQL Editor"** in the left sidebar (looks like a document with `<>` on it)
3. You'll see a blank editor where you can paste and run SQL

### Step 5: Run Migration Files (One at a Time)

You'll run these SQL files **in the order listed below**. For each one:

1. Open the file on your computer (they're in your sagereasoning folder)
2. **Select all** the text in the file (Ctrl+A on Windows, Cmd+A on Mac)
3. **Copy** it (Ctrl+C / Cmd+C)
4. Go to the Supabase SQL Editor tab in your browser
5. Click **"New query"** (or clear the editor if a query is already there)
6. **Paste** the SQL (Ctrl+V / Cmd+V)
7. Click the green **"Run"** button (bottom right)
8. Wait for it to say **"Success"** before moving to the next file
9. If you see an error, **stop and don't proceed** — we'll fix it together

**Run these files in this exact order:**

| Order | File Location (in your sagereasoning folder) | What It Creates |
|---|---|---|
| 1st | `api/supabase-schema.sql` | Core tables: profiles, action_scores, user_stoic_profiles, analytics_events |
| 2nd | `website/supabase-baseline-migration.sql` | Baseline assessments table |
| 3rd | `website/supabase-document-scores-migration.sql` | Document scores table |
| 4th | `website/supabase-reflections-migration.sql` | Daily reflections table |
| 5th | `website/supabase-milestones-migration.sql` | Milestones table |
| 6th | `website/supabase-location-migration.sql` | Location columns + community map view |
| 7th | `api/migrations/add-journal-entries-table.sql` | Journal entries table |
| 8th | `api/deliberation-chain-schema.sql` | Deliberation chains + steps tables |
| 9th | `api/api-keys-schema.sql` | API keys + usage metering tables |
| 10th | `api/revenue-model-migration.sql` | Revenue model updates to API keys |
| 11th | `website/supabase-v3-migration.sql` | V3 action evaluations table |
| 12th | `website/supabase-v3-baseline-progress-migration.sql` | V3 baseline + progress tables |
| 13th | `website/supabase-v3-agent-assessment-migration.sql` | V3 agent assessment tables |
| 14th | `website/supabase-receipts-patterns-migration.sql` | Reasoning receipts + patterns tables |

**Checkpoint:** After running all 14 files, click **"Table Editor"** in the left sidebar of your new Supabase project. You should see all your tables listed there. Count them — there should be roughly 16+ tables.

---

## PHASE 3: Update Your Environment Variables

Now you need to tell your website to use the new database instead of the old one. This involves changing three values in two places.

### Step 6: Update Your Local .env.local File

1. Open the file `website/.env.local` in your sagereasoning folder (use any text editor — Notepad on Windows, TextEdit on Mac)
2. Find these three lines and replace the old values with the new ones you saved in Step 3:

**Change this line:**
```
NEXT_PUBLIC_SUPABASE_URL=https://raqorxgrxdyezuntnojw.supabase.co
```
**To your new Project URL:**
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-NEW-PROJECT-REF.supabase.co
```

**Change this line:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your old long key)
```
**To your new Anon Key:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your new long key from Step 3)
```

**Change this line:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your old long key)
```
**To your new Service Role Key:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your new long key from Step 3)
```

3. **Save the file**

### Step 7: Update Vercel Environment Variables

1. Go to **https://vercel.com/dashboard**
2. Click on your **sagereasoning** project
3. Click **"Settings"** tab at the top
4. Click **"Environment Variables"** in the left sidebar
5. You'll see your existing variables listed. For each of these three, you need to update the value:

**Variable 1: `NEXT_PUBLIC_SUPABASE_URL`**
- Click the three dots (**...**) next to it, then click **"Edit"**
- Replace the old URL with your new Project URL
- Click **"Save"**

**Variable 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY`**
- Click the three dots (**...**) next to it, then click **"Edit"**
- Replace the old key with your new Anon Key
- Click **"Save"**

**Variable 3: `SUPABASE_SERVICE_ROLE_KEY`**
- Click the three dots (**...**) next to it, then click **"Edit"**
- Replace the old key with your new Service Role Key
- Click **"Save"**

### Step 8: Redeploy on Vercel

After changing the environment variables, Vercel needs to rebuild your site with the new values:

1. Still in your Vercel project, click the **"Deployments"** tab at the top
2. Find the most recent deployment (the top one in the list)
3. Click the three dots (**...**) on the right side of that deployment
4. Click **"Redeploy"**
5. A popup will appear — click **"Redeploy"** to confirm
6. Wait 1-2 minutes for the build to complete (you'll see a green checkmark when done)

---

## PHASE 4: Configure Auth Settings

### Step 9: Set Up Email Templates and Auth Redirects

1. In your **new** Supabase project, click **"Authentication"** in the left sidebar
2. Click **"URL Configuration"** (under Settings)
3. Set the **Site URL** to: `https://sagereasoning.com`
4. Under **Redirect URLs**, click **"Add URL"** and add:
   - `https://sagereasoning.com/**`
5. Click **"Save"**

### Step 10: Verify Auth Is Working

1. Open **https://sagereasoning.com** in your browser
2. Try signing up with a test email address (or your own email)
3. Check that you receive the confirmation email
4. Click the confirmation link and verify you land on the baseline assessment page

---

## PHASE 5: Verify Everything Works

### Step 11: Test the Website

Run through these checks on sagereasoning.com:

- [ ] Homepage loads without errors
- [ ] Sign-up works (create a new test account)
- [ ] Sign-in works (log in with the test account)
- [ ] Baseline assessment loads and can be submitted
- [ ] Dashboard loads after completing baseline
- [ ] Action scoring works (submit a test action)
- [ ] Daily reflection page works
- [ ] Document scoring page works
- [ ] Community map page loads

### Step 12: Test the API

If you have API endpoints set up, test them:

- [ ] API key creation works
- [ ] Agent assessment endpoint responds
- [ ] Deliberation chain endpoint responds

---

## PHASE 6: Clean Up

### Step 13: Update Your README

Update the README.md in your sagereasoning folder to reflect the new region. Change the Supabase section from:

> Region: Singapore

To:

> Region: US East (North Virginia)

And update the project reference URL to your new one.

### Step 14: Keep the Old Project (For Now)

**Do NOT delete your old Singapore project yet.** Keep it as a backup for at least 2 weeks while you verify everything works properly on the new one. After you're confident everything is stable, you can go to the old project in Supabase and delete it (Settings → General → Delete Project).

---

## If Something Goes Wrong

**Don't panic.** Your old Singapore project is still there and untouched. If anything breaks:

1. Go back to your `website/.env.local` file
2. Change the three values back to the old ones (they start with `raqorxgrxdyezuntnojw`)
3. Go to Vercel → Settings → Environment Variables and change them back too
4. Redeploy on Vercel
5. Your site will be back to using the old Singapore database

Then reach out and we'll troubleshoot what went wrong together.

---

## Quick Reference: What Changed

| Item | Old Value | New Value |
|---|---|---|
| Supabase Region | Singapore | US East (North Virginia) |
| Supabase Project URL | `https://raqorxgrxdyezuntnojw.supabase.co` | Your new URL |
| Supabase Anon Key | Old key (starts with eyJ...) | Your new key |
| Supabase Service Role Key | Old key (starts with eyJ...) | Your new key |
| Vercel | No changes to plan | Just redeploy after env var update |
| Domain | sagereasoning.com | No change |
| Cost | $0 | $0 |
