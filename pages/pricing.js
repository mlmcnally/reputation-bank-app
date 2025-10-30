<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Reputation Bank – Subscribe</title>
  <style>
    body {
      font-family: Avenir, "Nunito Sans", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      display: grid;
      place-items: center;
      background: #f8fafc;
      height: 100vh;
      margin: 0;
      color: #111;
    }
    .card {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
      padding: 24px;
      text-align: center;
      max-width: 400px;
    }
    h1 {
      color: #084a58;
      margin-bottom: 8px;
    }
    .price {
      font-size: 2rem;
      color: #084a58;
      margin: 8px 0 20px;
    }
    .btn {
      background: #084a58;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 12px 20px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 2px 2px 5px rgba(0,0,0,.2);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .status {
      margin-top: 10px;
      color: #b91c1c;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Get Full Access</h1>
    <p>Unlock the complete interactive edition of <em>The Reputation Bank</em>.</p>
    <div class="price">$49 / year</div>

    <button id="subscribe" class="btn">Buy Now</button>
    <div id="status" class="status"></div>
  </div>

  <script>
    document.getElementById('subscribe').addEventListener('click', async () => {
      const status = document.getElementById('status');
      status.textContent = '';
      const btn = document.getElementById('subscribe');
      btn.disabled = true;
      try {
        const res = await fetch('/api/create-checkout-session', { method: 'POST' });
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url; // Redirects to Stripe Checkout
        } else {
          status.textContent = data.error || 'Could not start checkout.';
          btn.disabled = false;
        }
      } catch (err) {
        console.error(err);
        status.textContent = 'Error starting checkout.';
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>
