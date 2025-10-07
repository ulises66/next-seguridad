import { test, expect } from '@playwright/test';

const URL = '/login';

test.describe('Login Page E2E', () => {
    test('Login exitoso redirige a /profile', async ({ page }) => {
        // Mock del backend para /api/login
        await page.route('**/api/login', async (route) => {
            const payload = JSON.parse(route.request().postData() || '{}');
            expect(payload).toEqual({ username: 'admin', password: '1234' });

            // Simula respuesta exitosa
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ token: 'fake-jwt', user: 'admin' }),
            });
        });

        await page.goto(URL);

        // Completa formulario
        await page.getByLabel('Usuario').fill('admin');
        await page.getByLabel('Contraseña').fill('1234');

        const button = page.getByRole('main').getByRole('button', { name: 'Ingresar' });

        // Click y espera de redirección
        await Promise.all([
            page.waitForURL('**/profile'),
            button.click(),
        ]);

        await expect(page).toHaveURL(/\/profile$/);
    });

    test('Credenciales inválidas muestra error', async ({ page }) => {
        // Mock respuesta 401
        await page.route('**/api/login', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Credenciales inválidas' }),
            });
        });

        await page.goto(URL);

        await page.getByLabel('Usuario').fill('wrong');
        await page.getByLabel('Contraseña').fill('nope');

        const form = page.locator('form');
        await form.getByRole('button', { name: 'Ingresar' }).click();

        // Verifica mensaje de error renderizado
        await expect(page.getByText('Credenciales inválidas')).toBeVisible();

        // Botón vuelve a habilitarse
        await expect(form.getByRole('button', { name: 'Ingresar' })).toBeEnabled();

        // No hubo redirección
        await expect(page).toHaveURL(/\/login$/);
    });

    test('Error de red muestra mensaje "Error de red"', async ({ page }) => {
        // Simula fallo de red
        await page.route('**/api/login', (route) => route.abort('failed'));

        await page.goto(URL);

        await page.getByLabel('Usuario').fill('admin');
        await page.getByLabel('Contraseña').fill('1234');

        const form = page.locator('form');
        await form.getByRole('button', { name: 'Ingresar' }).click();

        // Verifica que se muestre el mensaje de error
        await expect(page.getByText('Error de red')).toBeVisible();

        // Se mantiene en la misma página
        await expect(page).toHaveURL(/\/login$/);
    });

    // TEST FALLANDO INTENCIONALMENTE
    test('Login exitoso debería redirigir a /dashboard (fallará)', async ({ page }) => {
        await page.route('**/api/login', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ token: 'fake-jwt' }),
            });
        });

        await page.goto(URL);
        await page.getByLabel('Usuario').fill('admin');
        await page.getByLabel('Contraseña').fill('1234');

        const button = page.getByRole('main').getByRole('button', { name: 'Ingresar' });
        await Promise.all([
            page.waitForURL('**/profile'),
            button.click(),
        ]);

        // Fallará porque la URL real es /profile
        await expect(page).toHaveURL(/\/dashboard$/);
    });
});
