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
    const zip = cleanValue(formData.get('zip'));
    const details = cleanValue(formData.get('details'));
    const company = cleanValue(formData.get('company'));

    if (company) {
        return json({ message: 'Request received.' });
    }

    if (!name || !email) {
        return json({ message: 'Name and email are required.' }, 400);
    }

    if (!validEmail(email)) {
        return json({ message: 'Enter a valid email address.' }, 400);
    }

    const lines = [
        'New quote request from kennesawmountaingutters.com',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `ZIP: ${zip || 'Not provided'}`,
        '',
        'Property details:',
        details || 'Not provided',
    ];

    const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: env.FROM_EMAIL,
            to: [env.QUOTE_DESTINATION],
            reply_to: email,
            subject: `New gutter quote request from ${name}`,
            text: lines.join('\n'),
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

    return json({
        message: `Thanks, ${name}. Your quote request has been sent.`,
    });
}