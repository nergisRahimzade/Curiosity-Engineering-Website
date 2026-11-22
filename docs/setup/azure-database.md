# Set up the development database on Azure (W1D2-BE, Azure part)

**For:** the teammate who owns the Azure for Students subscription.
**Why:** the site stores its data in Azure PostgreSQL (see [architecture.md](../plan/architecture.md),
"Tech stack" and "Data"). Nergis is doing the code side (Prisma, `.env`) and needs the database to exist.
**Time:** about 30 minutes, plus waiting for Azure to create the server.

Never paste the database password into GitHub, a commit, a PR, a screenshot or a group chat.

## What you hand back

When you finish, send Nergis these five things (the password through a private channel only, such as
a password manager share or a direct message):

1. Server name (looks like `ceclub-dev.postgres.database.azure.com`)
2. Database name (`ceclub_dev`)
3. Admin username
4. Admin password
5. Port (`5432`, unless you changed it)

## Steps

### 1. Get the Azure for Students subscription

1. Go to <https://azure.microsoft.com/free/students/> and sign in with your school email.
2. Verify that you are a student. You get $100 credit for 12 months, with no credit card.
3. Open the [Azure portal](https://portal.azure.com) and check that **Subscriptions** lists
   "Azure for Students" and its status is **Active**.

### 2. Create a resource group

A resource group is a folder that holds everything for the project, so it can be deleted or
inspected as one unit.

1. Portal search bar → **Resource groups** → **Create**.
2. Subscription: Azure for Students. Name: `ceclub-dev-rg`. Region: the one closest to the team.
3. **Review + create** → **Create**.

### 3. Create the PostgreSQL flexible server

1. Search for **Azure Database for PostgreSQL flexible servers** → **Create**.
2. Fill in the **Basics** tab:
   - Resource group: `ceclub-dev-rg`
   - Server name: `ceclub-dev` (must be unique across Azure; add a suffix if it is taken)
   - Region: the same region as the resource group. Student subscriptions often limit which regions
     are allowed. If the portal rejects a region, pick another one from the list it offers.
   - PostgreSQL version: the newest one offered (16 or higher is fine)
   - Workload type: **Development**
   - Compute + storage: choose **Burstable**, **Standard_B1ms**, with the smallest storage (32 GiB).
     Check that the portal shows the free 12-month offer, or an estimated cost small enough for
     the $100 credit. If the price looks high, stop and ask Nergis.
   - Authentication method: **PostgreSQL authentication only**
   - Admin username: `ceclubadmin` (do not use `admin` or `postgres`; Azure blocks them)
   - Password: a long random one. Save it in a password manager now, because Azure never shows it again.
3. **Networking** tab:
   - Connectivity method: **Public access**
   - Tick **Allow public access from any Azure service within Azure to this server**. The app on
     Azure App Service will need this later.
   - Add a firewall rule for your own IP with **Add current client IP address**.
4. Leave the other tabs at their defaults. **Review + create** → **Create**. Deployment takes a few minutes.

### 4. Create the database

1. Open the new server → **Settings** → **Databases** → **Add**.
2. Name: `ceclub_dev` → **Save**.

### 5. Let teammates connect

Azure blocks every IP address that is not listed. For each teammate who will run the site locally:

1. Ask them for their public IP (they can search "what is my IP").
2. Server → **Settings** → **Networking** → **Add firewall rule**.
   Name it after the person, enter the IP as both start and end, then **Save**.

Home and campus IPs change. When someone's connection stops working, update their rule.

### 6. Let Nergis manage the server (important for handover)

An Azure for Students subscription belongs to one person's school email (see "Handover" in the
architecture doc). So the club does not lose access if you graduate or lose the account:

1. Resource group `ceclub-dev-rg` → **Access control (IAM)** → **Add** → **Add role assignment**.
2. Role: **Contributor**. Members: Nergis's account. Complete the assignment.

### 7. Protect the credit

1. Search **Cost Management + Budgets** → **Add** → create a budget of $20 per month with an
   email alert at 80%.
2. When nobody needs the database for a while, open the server and click **Stop**. Azure
   restarts it automatically after 7 days, so check it from time to time.

### 8. Check that it works

If you have `psql` installed, run this with your own values (it asks for the password):

```
psql "host=SERVER.postgres.database.azure.com port=5432 dbname=ceclub_dev user=ceclubadmin sslmode=require" -c "SELECT 1;"
```

It should print one row with `1`. If you do not have `psql`, skip this. Nergis will check the
connection from the code.

## If something goes wrong

- **"Connection timed out":** your IP is missing from the firewall rules (step 5).
- **"SSL required" or "no encryption":** the connection must use `sslmode=require`.
- **The region is not allowed or has no capacity:** pick another region and create the resource
  group and server again there.
- **Password rejected:** reset it under the server's **Overview** → **Reset password**.

## Not part of this task

The production server, Blob Storage and App Service are created in W6D1. Do not create them now.
