// Place Coworking — ESP32 Wi-Fi heartbeat (one board per floor SSID). DRAFT.
// Board: any ESP32 DevKit (~150–250 THB) + USB 5V charger. Arduino IDE / PlatformIO.
// Sends a ping to Healthchecks.io every 2 minutes while the floor Wi-Fi has internet.
// If Wi-Fi or the internet is down, pings stop -> Healthchecks marks the check down.
#include <WiFi.h>
#include <HTTPClient.h>

const char* SSID   = "REPLACE_FLOOR_SSID";
const char* PASS   = "REPLACE_WIFI_PASSWORD";      // do not commit real passwords
const char* HC_URL = "https://hc-ping.com/REPLACE-WITH-CHECK-UUID";
const unsigned long PERIOD_MS = 120000;

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);
  for (int i = 0; i < 30 && WiFi.status() != WL_CONNECTED; i++) delay(1000);
}

void setup() { connectWiFi(); }

void loop() {
  connectWiFi();
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(HC_URL) + "?rssi=" + WiFi.RSSI();   // RSSI lands in the Healthchecks log
    http.setTimeout(10000);
    http.begin(url);
    http.GET();
    http.end();
  }
  delay(PERIOD_MS);
  if (millis() > 86400000UL) ESP.restart();                 // daily self-restart
}
