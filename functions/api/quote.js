const JSON_HEADERS = {
    'content-type': 'application/json; charset=UTF-8',
};

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: JSON_HEADERS,
    });
}

function cleanValue(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

async function sendEmail(env, payload) {
    return fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

function buildBusinessHtml({ name, email, phone, address, details }) {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || 'Not provided');
    const safeAddress = escapeHtml(address || 'Not provided');
    const safeDetails = escapeHtml(details || 'Not provided').replaceAll('\n', '<br>');

    return `
        <div style="margin:0;padding:32px;background:#f3efe4;font-family:Arial,sans-serif;color:#1e2d25;">
            <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e6dccb;border-radius:20px;overflow:hidden;">
                <div style="padding:24px 28px;background:#304c3d;color:#fff8f0;">
                    <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;opacity:0.8;">Kennesaw Mountain Gutters</p>
                    <h1 style="margin:0;font-size:28px;line-height:1.1;">New quote request received</h1>
                </div>
                <div style="padding:28px;">
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">A new quote request came in through kennesawmountaingutters.com.</p>
                    <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6;">
                        <tr><td style="padding:8px 0;font-weight:700;width:140px;vertical-align:top;">Name</td><td style="padding:8px 0;">${safeName}</td></tr>
                        <tr><td style="padding:8px 0;font-weight:700;vertical-align:top;">Email</td><td style="padding:8px 0;">${safeEmail}</td></tr>
                        <tr><td style="padding:8px 0;font-weight:700;vertical-align:top;">Phone</td><td style="padding:8px 0;">${safePhone}</td></tr>
                        <tr><td style="padding:8px 0;font-weight:700;vertical-align:top;">Address</td><td style="padding:8px 0;">${safeAddress}</td></tr>
                    </table>
                    <div style="margin-top:24px;padding:20px;border:1px solid #e8dfd0;border-radius:16px;background:#fbf7ef;">
                        <p style="margin:0 0 10px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#aa5b32;font-weight:700;">Property details</p>
                        <p style="margin:0;font-size:15px;line-height:1.7;">${safeDetails}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function buildCustomerHtml({ name, address }) {
    const safeName = escapeHtml(name);
    const safeAddress = escapeHtml(address || 'your property');

    return `
        <div style="margin:0;padding:32px;background:#f3efe4;font-family:Arial,sans-serif;color:#1e2d25;">
            <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e6dccb;border-radius:20px;overflow:hidden;">
                <div style="padding:24px 28px;background:linear-gradient(135deg,#304c3d,#1e2d25);color:#fff8f0;">
                    <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;opacity:0.8;">Kennesaw Mountain Gutters</p>
                    <h1 style="margin:0;font-size:28px;line-height:1.1;">We received your quote request</h1>
                </div>
                <div style="padding:28px;">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hi ${safeName},</p>
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Thanks for reaching out to Kennesaw Mountain Gutters. We received your request for service at ${safeAddress}, and someone will get back to you soon with next steps.</p>
                    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;">If you need to add anything else before we reply, you can respond directly to this email.</p>
                    <div style="padding:18px 20px;border:1px solid #e8dfd0;border-radius:16px;background:#fbf7ef;">
                        <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#aa5b32;font-weight:700;">What happens next</p>
                        <p style="margin:0;font-size:15px;line-height:1.7;">We review the request, confirm the property details, and follow up with pricing or scheduling information based on the scope of the work.</p>
                    </div>
                    <p style="margin:24px 0 0;font-size:16px;line-height:1.7;">Thank you,<br>Kennesaw Mountain Gutters</p>
                </div>
            </div>
        </div>
    `;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.RESEND_API_KEY || !env.QUOTE_DESTINATION || !env.FROM_EMAIL) {
        return json({ message: 'Email delivery is not configured yet.' }, 500);
    }

    let formData;

    try {
        formData = await request.formData();
    } catch {
        return json({ message: 'Invalid form submission.' }, 400);
    }

    const name = cleanValue(formData.get('name'));
    const email = cleanValue(formData.get('email'));
    const phone = cleanValue(formData.get('phone'));
    const address = cleanValue(formData.get('address'));
    const details = cleanValue(formData.get('details'));
    const company = cleanValue(formData.get('company'));

    if (company) {
        return json({ message: 'Request received.' });
    }

    if (!name || !email || !phone || !address) {
        return json({ message: 'Name, email, phone number, and address are required.' }, 400);
    }

    if (!validEmail(email)) {
        return json({ message: 'Enter a valid email address.' }, 400);
    }

    const lines = [
        'New quote request from kennesawmountaingutters.com',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Address: ${address}`,
        '',
        'Property details:',
        details || 'Not provided',
    ];

    const resendResponse = await sendEmail(env, {
        from: env.FROM_EMAIL,
        to: [env.QUOTE_DESTINATION],
        reply_to: email,
        subject: `New gutter quote request from ${name}`,
        text: lines.join('\n'),
        html: buildBusinessHtml({
            name,
            email,
            phone,
            address,
            details,
        }),
    });

    if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        return json(
            {
                message: 'Unable to send your request right now.',
                detail: errorText,
            },
            502
        );
    }

    const acknowledgmentText = [
        `Hi ${name},`,
        '',
        'Thanks for contacting Kennesaw Mountain Gutters.',
        `We received your quote request for ${address}, and someone will get back to you soon.`,
        '',
        'If you need to add anything else before we reply, you can respond directly to this email.',
        '',
        'Thank you,',
        'Kennesaw Mountain Gutters',
    ].join('\n');

    const acknowledgmentResponse = await sendEmail(env, {
        from: env.FROM_EMAIL,
        to: [email],
        reply_to: env.QUOTE_DESTINATION,
        subject: 'We received your gutter quote request',
        text: acknowledgmentText,
        html: buildCustomerHtml({ name, address }),
    });

    if (!acknowledgmentResponse.ok) {
        const errorText = await acknowledgmentResponse.text();
        return json(
            {
                message: 'Your request was received, but the confirmation email could not be sent.',
                detail: errorText,
            },
            502
        );
    }

    return json({
        message: `Thanks, ${name}. Your quote request has been sent.`,
    });
}