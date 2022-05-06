/*
© Google LLC, 2015, 2019, 2020, 2021. Все права защищены.
 Данный файл лицензирован на условиях лицензии Apache License 2.0 ("Лицензия");
 использовать этот файл разрешено только в соответствии с Лицензией.
 Текст Лицензии можно получить по адресу
 http://www.apache.org/licenses/LICENSE-2.0
 За исключением случаев, предусмотренных действующим законодательством или согласованных в письменной форме, программное обеспечение,
 распространяемое на условиях Лицензии, предоставляется на УСЛОВИЯХ "КАК ЕСТЬ",
 БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ ИЛИ УСЛОВИЙ, явных или подразумеваемых.
 Сведения об основных разрешениях и ограничениях в рамках Лицензии для определенных языков
 см. в тексте Лицензии.
*/

// Если увеличить значение переменной OFFLINE_VERSION, будет создано событие установки и
// ранее кэшированные ресурсы будут обновлены из сети.
// Эта переменная намеренно объявлена и не используется.
// Если нужно, добавьте комментарий для своего анализатора кода:
// eslint-disable-next-line no-unused-vars
const OFFLINE_VERSION = 1;
const CACHE_NAME = "offline";
// При необходимости укажите здесь другой URL-адрес.
const OFFLINE_URL = "offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Если настроить {cache: 'reload'} в новом запросе,
      // ответ гарантированно не будет получен из кэша HTTP; т. е. он будет получен из
      // сети.
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    })()
  );
  // Принудительный перевод ожидающего служебного сценария в активное состояние.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Включение предварительной загрузки при переходе между страницами, если эта функция поддерживается.
      // См. сведения по ссылке https://developers.google.com/web/updates/2017/02/navigation-preload
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  // Сообщаем активному служебному сценарию, что необходимо немедленно получить контроль над страницей.
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Нам нужно вызвать функцию event.respondWith(), только если это запрос на переход между
  // HTML-страницами.
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Прежде всего попытаемся использовать ответ предварительной загрузки при переходе между страницами, если эта функция поддерживается.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Всегда сначала проверяйте сеть.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Событие catch появляется только при возникновении исключения, которое, вероятно,
          // вызвано ошибкой сети.
          // Если функция fetch() возвращает допустимый ответ HTTP с кодом ответа в
          // диапазоне 4xx или 5xx, функция catch() НЕ будет вызвана.
          console.log("Не удалось получить данные; вместо этого возвращаем страницу для автономного режима.", error);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  }

  // Если выражение в условии if() ложно, то этот обработчик операции получения данных не перехватит
  // запрос. Если зарегистрированы любые другие обработчики операций получения данных, они
  // смогут вызвать метод event.respondWith(). Если ни один обработчик операций получения данных не вызовет метод
  // event.respondWith(), браузер обработает запрос таким образом, как если бы
  // не были задействованы никакие служебные сценарии.
});