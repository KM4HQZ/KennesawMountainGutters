# Cloudflare Setup For Kennesaw Mountain Gutters

## Recommended architecture

- Host the site on Cloudflare Pages.
- Use the Pages Function in `functions/api/quote.js` for private form handling.
- Store the quote destination and email API key as Cloudflare Pages secrets.
- Use Proton Mail with your custom domain if you want to send and reply as `info@kennesawmountaingutters.com`.

## Important email constraint

Cloudflare Email Routing is good for forwarding inbound mail, but it is not a full outbound mailbox. If you want to reply as `info@kennesawmountaingutters.com`, the clean path is:

1. Put your custom domain on a paid Proton Mail plan.
2. Create `info@kennesawmountaingutters.com` in Proton.
3. Point your domain MX records to Proton, not Cloudflare Email Routing.
4. Add Proton SPF, DKIM, and DMARC records in Cloudflare DNS.

That gives you a real mailbox that can send and receive as your domain.

## Form delivery model

The public site does not contain your destination mailbox address.

The Pages Function reads these environment variables from Cloudflare:

- `RESEND_API_KEY`: API key from Resend
- `QUOTE_DESTINATION`: destination mailbox, such as `info@kennesawmountaingutters.com` or your Proton address during transition
- `FROM_EMAIL`: verified sender address, such as `quotes@kennesawmountaingutters.com`

## Why Resend is in the middle

Cloudflare Pages Functions can call HTTPS APIs directly. Resend provides a simple email API and supports sending from your domain once the domain is verified there.

The practical flow is:

1. Visitor submits the quote form.
2. Cloudflare Pages Function receives the form privately.
3. The function sends an email through Resend.
4. The message lands in your mailbox at `info@kennesawmountaingutters.com` or your Proton inbox.

## Cloudflare Pages setup

1. Create a new Pages project.
2. Deploy this folder as a direct upload project or connect it to Git.
3. In Pages project settings, add these production secrets:
   - `RESEND_API_KEY`
   - `QUOTE_DESTINATION`
   - `FROM_EMAIL`
4. Redeploy the project after secrets are added.

## DNS and mailbox setup

### If you want a real `info@kennesawmountaingutters.com` mailbox in Proton

1. Upgrade to a paid Proton plan that supports custom domains.
2. Add `kennesawmountaingutters.com` in Proton Mail domain settings.
3. In Cloudflare DNS, add the Proton verification, MX, SPF, DKIM, and DMARC records Proton gives you.
4. Create `info@kennesawmountaingutters.com` in Proton.
5. Optionally create `quotes@kennesawmountaingutters.com` as the sending identity for form notifications.

### If you want to keep using `kennesawmountaingutters@proton.me` for now

1. Set `QUOTE_DESTINATION` to that Proton address.
2. Keep the form private through the Pages Function.
3. Later, move to Proton custom domain and change only the secret value.

## Reply behavior

The form handler sets the quote submitter's email as `reply_to`, so when you open the notification email, replying will target the customer automatically.

If your mailbox is `info@kennesawmountaingutters.com`, your replies will come from that address.

## Minimum credentials I would need to finish setup for you

If you want me to handle the configuration from here, I would need:

1. A scoped Cloudflare API token for Pages and DNS changes.
2. A Resend API key.
3. Confirmation of the sender address you want to use, preferably `quotes@kennesawmountaingutters.com` or `info@kennesawmountaingutters.com`.
4. Confirmation whether Proton custom domain is already enabled on a paid plan.