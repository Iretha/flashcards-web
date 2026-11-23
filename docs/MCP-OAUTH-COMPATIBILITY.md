# Flashcards MCP OAuth compatibility

Дата: 2026-11-23. Branch: feature/auth. Решение: **CONDITIONAL GO за изолиран PoC; NO-GO за публично включване засега.**

Supabase може да остане единственият authorization server. Не е доказано, че конкретният проект изпълнява RFC 8707, нито че ChatGPT и Claude завършват реалния flow. Няма реализиран endpoint или обявени успешни OAuth тестове. Спираме преди външната конфигурация, необходима за тези доказателства.

## Съществуваща реализация

Прегледани: AUTH-ARCHITECTURE.md, AUTH-SETUP.md, src/server/supabase-auth.ts, src/server/auth.ts и package.json. Google и email OTP дават Supabase identity, след което приложението издава независима D1 сесия. Provider токените не се пазят постоянно. validateClaims проверява issuer, ES256/RS256, aud=authenticated, expiry и session claims. users.supabase_sub е единственият ключ за identity mapping. Този verifier не трябва да се използва непроменен за MCP. Supabase RLS не защитава D1.

.dev.vars не е отпечатан или използван за remote операции. Не са променяни production, потребители, данни, Dashboard, flags или migrations.

## Матрица на съвместимостта

| Възможност | Официално основание | Статус за Flashcards |
|---|---|---|
| OAuth authorization server | Supabase [S1] | Документиран; проектът непроверен |
| AS discovery | Issuer /auth/v1; metadata /.well-known/oauth-authorization-server/auth/v1 [S2] | Непроверен live |
| Protected resource discovery | RFC 9728 и Bearer challenge [S4] | Трябва да се реализира в Worker |
| DCR | Опционално включване в Dashboard [S2] | Не е включвано/тествано |
| Code + PKCE | Supabase flow и MCP [S3,S4] | Няма реален exchange |
| Refresh | Supabase издава refresh tokens [S2] | Rotation/reuse/expiry непроверени |
| Revocation | Изисква се оперативна проверка | RFC 7009 endpoint и ефектът върху издаден JWT не са доказани |
| RFC 8707 resource | MCP изисква resource binding [S4] | Блокиращ gate: не е доказано от Supabase ръководствата |
| Audience | Default authenticated; hook за custom aud [S5] | Нужен изолиран тест на issuance и refresh |
| Custom scopes | Неподдържани според [S3] | Използваме app grants, не измислен OAuth scope |
| ChatGPT | CIMD предпочитан; DCR поддържан [S6] | Изберете DCR ако Supabase няма доказан CIMD; live непроверен |
| Claude custom connector | Предварителен client ID/secret [S7] | Възможен отделен статичен client; live непроверен |
| Supabase Free | MCP няма отделна такса, MAU accounting [S2] | Проверете конкретния Free проект и hook entitlement; няма обещание за неограничен ресурс |

## Архитектура

ChatGPT/Claude → отделен Worker /mcp → Supabase issuer/JWKS и D1 authorization → get_decks.

Worker публикува RFC 9728 metadata с един каноничен HTTPS resource и точния Supabase issuer. Не проксира token exchange и не издава свои OAuth токени. Не приема app cookie, management API token или Supabase ID token като MCP bearer.

Отделен verifier изисква подпис с ES256/RS256, точен issuer, exp/nbf, sub, OAuth client_id от изричен allowlist и единствен aud равен на MCP resource. Отхвърля authenticated и multi-audience токени по избраната строга политика. JWKS адресът е фиксиран, не се взема от bearer header. Hook определя aud само за одобрени MCP client IDs; не променя обикновения login. DCR създаден client не получава автоматично доверие. Custom aud по client_id не доказва обработване на resource!

За всеки request D1 проверява активен grant (user_id, client_id, resource, read/write, revoked_at, expiry), по възможност обвързан със session_id. Първата версия разрешава само read и само get_decks. Не използвайте user_metadata, client_name, profile/email/openid като права. Write изисква ново изрично съгласие и отделна проверка. Grant таблицата е resource-server authorization, не собствен authorization server.

sub се съпоставя само с вече съществуващ users.supabase_sub. Няма auto-create/merge в MCP. SQL филтрира по mapped user_id с bind parameters; аргументи от клиента не избират собственик. get_decks връща само собствени тестета и минимални полета, с pagination и лимит. Shared decks са извън първия PoC. Revoked grant спира следващата заявка дори JWT още да е валиден; при недостъпен grant store отказваме достъп. Logout на app и OAuth disconnect са различни операции.

## Сесия и consent

Сегашният flashcards_session не е Supabase session и не може да удостоверява Supabase OAuth consent API. Не създавайте provider session от D1 cookie и не подписвайте impersonation token. Повторен Google/OTP login към Supabase е безопасният начален вариант. Съществуваща действителна Supabase browser session може да се използва само след provider validation. Сравнете нейния sub с D1 mapping; mismatch изисква изричен избор/нов login, без linking по email. Legacy/QR-only сесия не е достатъчна.

Consent UI използва Supabase authorization-details/approve/deny flow за действителния authorization_id, проверява CSRF и текущата provider identity, показва client, resource и read права. Не доверява redirect URI от query; използва валидирания provider резултат. Supabase запазва отговорността за code, state/redirect binding, PKCE и token issuance. Не пазете refresh tokens в браузърно localStorage или логове.

## Задължителна следваща външна стъпка — STOP

1. В отделен Supabase Free test project, без production users, проверете Authentication → OAuth Server, наличност на функцията и custom access token hook без платено включване. Ако изисква плащане, спрете.
2. Конфигурирайте тестов consent URL и асиметрични signing keys. Регистрирайте отделни ChatGPT/Claude clients с точните callback URI от текущия UI. За Claude документацията дава https://claude.ai/api/mcp/auth_callback; за ChatGPT копирайте URI от management UI, не предполагаем стар callback.
3. За DCR тест го разрешете само в тестовия проект. Проверете advertised registration_endpoint и supported token authentication methods; не приемайте CIMD за DCR. Не включвайте DCR в production.
4. Преди реални клиенти осигурете отделен HTTPS test Worker и изолирана D1 с измислени decks/users. Това е външна стъпка и не е изпълнено. Не използвайте production binding или публично включване без нова инструкция.
5. Изпълнете следната матрица и запишете само redacted резултати, статуси, claim names и timestamp. Не записвайте кодове/verifiers/токени/секрети.

## Тестова матрица и доказателства

Всички редове по-долу са **NOT RUN**, а не passing mock tests. Няма нов код, следователно не са стартирани regression tests. Локално е проверена само структурата на съществуващия auth код и чистият начален git status.

| Тест | Очакван резултат |
|---|---|
| Реален OAuth access token, mapped user A, active read grant | get_decks връща само A |
| Подменен подпис, изтекъл токен, грешен issuer, ID token | 401, без данни |
| Друг aud, authenticated aud, resource на друг сървър | Отказ; никакъв fallback |
| Валиден JWT без read grant | 403 |
| A подава user/deck ID на B | Няма достъп до B; параметърът се отхвърля или игнорира по schema |
| Отнемане на grant, повторен request със стар JWT | Незабавен отказ |
| Provider revocation и последващ refresh | Refresh отказан; измерете отделно стария access token |
| DCR валиден metadata / invalid redirect / unsupported auth method | Коректна регистрация / контролирани откази |
| PKCE S256 добър verifier | Реален code exchange |
| Липсващ/грешен verifier, code replay, redirect mismatch | Отказ |
| Refresh rotation и повторно използване на стар refresh | Измерено provider поведение; audience не се разширява |
| resource в authorize и token еднакъв | JWT bound към каноничния resource |
| resource липсващ, чужд, malformed, повторен, сменен при exchange/refresh | Документиран отказ или доказана безопасна политика; silent ignore не минава RFC 8707 gate |
| Реален ChatGPT и Claude connect/consent/tool/disconnect | Отделен запис за всеки клиент |

Локални unit тестове със synthetic signed JWT могат впоследствие да докажат verifier/ACL поведението, но не Supabase issuance, DCR, PKCE или client interoperability. Не е оправдано да конструираме успешен endpoint преди да знаем реалния token contract.

## Рискове и решение

Най-съществени рискове: generic audience token replay, silent resource ignore, автоматично доверие към DCR клиенти, consent върху чужда identity, stale JWT след revocation и объркване на Supabase RLS с D1 ownership. Free квоти, inactivity pause и достъпността на настройките трябва да се потвърдят в тестовия акаунт.

**CONDITIONAL GO** означава, че архитектурата заслужава изолиран тест без собствен AS. Не означава успешна интеграция. Ако Supabase игнорира resource и не може безопасно да го валидира/обвърже за authorize, exchange и refresh, резултатът за изисканата MCP съвместимост става **NO-GO**. Hook, който само сменя aud, не премахва този gate.

Минимален план: (1) потвърждение Free и test Dashboard; (2) реални discovery/DCR/PKCE/resource/refresh/revoke probes; (3) едва след успешен token contract — изолиран Worker със Streamable HTTP initialize, notifications/initialized, tools/list, tools/call и get_decks, без production route; (4) verifier/ACL тестовете от матрицата върху ephemeral D1; (5) реални HTTPS сесии с двата клиента; (6) отделно решение за бъдещ rollout. Не се изпълнява npm run deploy: включва remote migration.

## Официални източници

Прегледани онлайн на 2026-11-23. Документацията е доказателство за описана възможност, не за настройките на конкретния проект.

- [S1: Supabase OAuth Server](https://supabase.com/docs/guides/auth/oauth-server)
- [S2: Supabase MCP authentication](https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication)
- [S3: Supabase OAuth flows — scopes и flow](https://supabase.com/docs/guides/auth/oauth-server/oauth-flows)
- [S5: Supabase token security — client_id и custom audience hook](https://supabase.com/docs/guides/auth/oauth-server/token-security)
- [Supabase consent setup](https://supabase.com/docs/guides/auth/oauth-server/getting-started)
- [S4: MCP authorization, текуща версия 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
- [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707)
- [S6: OpenAI MCP authentication, текущо пренасочване от Apps SDK](https://developers.openai.com/plugins/build/auth)
- [S7: Claude custom remote connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)

Claude API remote MCP connector и Claude consumer custom connector са различни интеграции; успех с ръчно подаден API bearer не доказва consumer OAuth flow.
