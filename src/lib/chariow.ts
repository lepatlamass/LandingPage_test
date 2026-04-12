// Chariow API client (server-side only — never import in client components)
const CHARIOW_BASE_URL = 'https://api.chariow.com/v1';

function getApiKey(): string {
  const key = process.env.CHARIOW_API_KEY;
  if (!key) {
    throw new Error('CHARIOW_API_KEY is not set');
  }
  return key;
}

export interface ActivateLicenseResponse {
  message: string;
  data: {
    id: string;
    license_key: string;
    status: string;
    activated_at: string;
    expires_at: string;
    activation_count: number;
    max_activations: number;
    activations_remaining: number;
    is_active: boolean;
    can_activate: boolean;
    product: { id: number; name: string };
  };
  errors: string[];
}

export interface ProductInfo {
  id: string;
  name: string;
  currentPrice: {
    value: number;
    formatted: string;
    short: string;
    currency: string;
  };
  originalPrice?: {
    value: number;
    formatted: string;
    short: string;
    currency: string;
  };
  priceOff?: string;
}

/**
 * Fetch product details from Chariow API.
 * Prices are already in the store owner's local currency.
 */
export async function getProduct(productId: string): Promise<ProductInfo> {
  const res = await fetch(
    `${CHARIOW_BASE_URL}/products/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }

  const json = await res.json();
  const d = json.data;
  const pricing = d.pricing;

  return {
    id: d.id,
    name: d.name,
    currentPrice: pricing?.current_price ?? { value: 0, formatted: '$0', short: '0', currency: 'USD' },
    originalPrice: pricing?.price ?? undefined,
    priceOff: pricing?.price_off ?? undefined,
  };
}

/**
 * Activate a license key via Chariow API.
 */
export async function activateLicense(
  licenseKey: string,
  deviceIdentifier?: string
): Promise<ActivateLicenseResponse> {
  const res = await fetch(
    `${CHARIOW_BASE_URL}/licenses/${licenseKey}/activate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_identifier: deviceIdentifier }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.errors?.[0] || `Chariow API error: ${res.status}`
    );
  }

  return res.json();
}

/**
 * Validate a license key without activating it.
 */
export async function validateLicense(licenseKey: string) {
  const res = await fetch(`${CHARIOW_BASE_URL}/licenses/${licenseKey}`, {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!res.ok) {
    return { isValid: false, error: 'Invalid license key' };
  }

  const json = await res.json();
  const license = json.data;

  if (license.status === 'revoked') {
    return { isValid: false, error: 'This license has been revoked' };
  }
  if (
    license.status === 'expired' ||
    new Date(license.expires_at) < new Date()
  ) {
    return { isValid: false, error: 'This license has expired' };
  }
  if (!license.can_activate && license.status === 'pending_activation') {
    return { isValid: false, error: 'License cannot be activated' };
  }

  return {
    isValid: true,
    data: {
      productName: license.product?.name,
      expiresAt: license.expires_at,
      maxActivations: license.max_activations,
      activationsRemaining: license.activations_remaining,
    },
  };
}
