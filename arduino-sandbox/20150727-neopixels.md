# NeoPixels are sweet!

Just pasting code as I hack... so far a toggle.
```
#include <Adafruit_NeoPixel.h>
#define NEOPIN 5
#define NUMPIXELS 5
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, NEOPIN, NEO_RGB + NEO_KHZ800);

void initPixels()
{
  for(int i=0;i<NUMPIXELS;i++){
    pixels.setPixelColor(i, pixels.Color(0,0,0));
  }

  pixels.show();
}


typedef struct {
  uint32_t current;
  uint32_t target;
  int ttl; // milisecs remaining.
 } neoset;

neoset record[NUMPIXELS];

int tick = 0;


void setup()
{
  Serial.begin(9600);
  pixels.begin();
  while (! Serial); // Wait untilSerial is ready!
  int pixelCount = NUMPIXELS - 1;
  String msg = "Enter LED Number 0 to " + String(pixelCount) + " or 'x' to clear";
  Serial.println(msg);
  initPixels();
}


void loop()
{
  if (Serial.available())
  {
    char ch = Serial.read();
    if (ch >= '0' && ch <= '4')
    {
      int led = ch - '0';

      toggle(led);
      Serial.print("Turned on LED ");
      Serial.println(led);
    }
    if (ch == 'x')
    {
      clearPixels();
      Serial.println("Cleared");
    }
  }

  // HERE DO THE TWEENING


  // SET THE TICK SO THAT AS WE LOOP WE KNOW WHEN WE LAST RAN.
  tick = millis();

  delay(100); // THIS IS A DEBUG DELAY :)
}


void toggle(int led) {
  uint32_t current = pixels.getPixelColor(led);
  if (current == pixels.Color(0,200,0)) {
    clearPixel(led);
  } else {
    setGreen(led);
  }
}


void setRed(int led)
{
 return setColor(led, pixels.Color(200, 0, 0));
}

void setBlue(int led)
{
 return setColor(led, pixels.Color(0, 0, 200));
}

void setGreen(int led)
{
 return setColor(led, pixels.Color(0, 200, 0));
}

void clearPixel(int led) {
  return setColor(led, pixels.Color(0, 0, 0));
}

void clearPixels() {
  for(int i=0;i<NUMPIXELS;i++){
    clearPixel(i);
  }
}

void setColor(int led, uint32_t color)
{
  for(int i=0;i<NUMPIXELS;i++){

    if (led == i) {
      pixels.setPixelColor(i, color);
    }

  }
  pixels.show();
}


void tweenColor() {
  // loop through all the pixels - work out the tween for each and do it...
  // use millis.

  int tock = millis();
  int delta = tock - tick;

  // neopixels run at 800Hz - nothing to see if less than say 4ms..
  if (delta > 4) {
    for(int i=0;i<NUMPIXELS;i++){


    }
  }
}
```




AT end of day have this...

```
#include <Adafruit_NeoPixel.h>
#define NEOPIN 5
#define NUMPIXELS 5
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, NEOPIN, NEO_RGB + NEO_KHZ800);

void initPixels()
{
  for(int i=0;i<NUMPIXELS;i++){
    pixels.setPixelColor(i, pixels.Color(0,0,0));
  }

  pixels.show();
}



// easy ref to colors...
typedef struct rgb {
  uint8_t r;
  uint8_t g;
  uint8_t b;
};

typedef struct pixelType {
  uint32_t target; // target color.
  uint16_t ttl; // milisecs remaining
  boolean pulse; // pulse up an down ~50 on each
  uint32_t pulsecolor;
};

pixelType neoset[NUMPIXELS];


rgb aColor = {0, 0, 0};
// http://playground.arduino.cc/Code/Struct - can't use structs to return from func unless in a def file.
void getColors(uint32_t c) {

  uint8_t r = (uint8_t)(c >> 16);
  uint8_t g = (uint8_t)(c >> 8);
  uint8_t b = (uint8_t)(c >> 0);

  aColor = {r, g, b};
}

int tick = 0;


void setup()
{
  Serial.begin(9600);
  pixels.begin();
  while (! Serial); // Wait untilSerial is ready!
  int pixelCount = NUMPIXELS - 1;
  String msg = "Enter LED Number 0 to " + String(pixelCount) + " or 'x' to clear";
  Serial.println(msg);
  initPixels();

}


void loop()
{
  if (Serial.available())
  {
    char ch = Serial.read();
    if (ch >= '0' && ch <= '4')
    {
      int led = ch - '0';

      toggle(led);
      Serial.println("Toggle: " + String(led));
    }
    if (ch == 'x')
    {
      clearPixels();
      Serial.println("Cleared");
    }
    if (ch == 'a')
    {
      randomSeed(millis());
      allrand();
      Serial.println("Randomizing!");
    }
  }

  // HERE DO THE TWEENING
  tweenColor();

  // SET THE TICK SO THAT AS WE LOOP WE KNOW WHEN WE LAST RAN.
  tick = millis();

  //delay(10); // THIS IS A DEBUG DELAY :)
}

void allrand() {
  for(int i=0;i<NUMPIXELS;i++){
    randcolor(i);
  }
}

void randcolor(int led) {

    int m = random(0,200);
    int n = random(0,200);
    int o = random(0,200);

    setColor(led, pixels.Color(m, n, o), 1000);  
}

void toggle(int led) { // to a random color.
  uint32_t current = pixels.getPixelColor(led);
  if (current != pixels.Color(0,0,0)) {
    clearPixel(led);
  } else {
    randcolor(led);
  }
}

void setRed(int led)
{
 return setColor(led, pixels.Color(200, 0, 0), 500);
}

void setBlue(int led)
{
 return setColor(led, pixels.Color(0, 0, 200), 500);
}

void setGreen(int led)
{
 return setColor(led, pixels.Color(0, 200, 0), 500);
}

void clearPixel(int led) {
  return setColor(led, pixels.Color(0, 0, 0), 500);
}

void clearPixels() {
  for(int i=0;i<NUMPIXELS;i++){
    clearPixel(i);
  }
}

void setColor(int led, uint32_t color, int inMillis)
{
  for(int i=0;i<NUMPIXELS;i++){

    if (led == i) {

      neoset[i].target = color;
      neoset[i].ttl = inMillis;
      // TODO - clear pulse values
    }

  }
}



void pulseAll() {
  // TODO - set pulse boolean on all..
}

void pulsePixel() {
  // TODO - set pulse pixel on a single  
}

void doPulse() {
  // TODO - for all pixels if pulse on and ttl = 0 set target to 50 above or below current color.
}

void tweenColor() {
  // loop through all the pixels - work out the tween for each and do it...
  // use millis.

  int tock = millis();
  int delta = tock - tick;


  bool changed = false;

  if (delta > 0) {

    //Serial.println("++++++++ delta " + String(delta));

    for(int i=0;i<NUMPIXELS;i++){


      uint32_t current = pixels.getPixelColor(i);

      if (current != neoset[i].target) { // We are not at target - so do the math.

        if (neoset[i].ttl == 0 || delta > neoset[i].ttl) {
          Serial.println("Completed " + String(i));
          pixels.setPixelColor(i, neoset[i].target); // just set the color and move on.
          neoset[i].ttl = 0;
        } else {

          // STEP TWEEN!
          // This is horrible...
          getColors(neoset[i].target);
          rgb t = aColor;

          getColors(pixels.getPixelColor(i));
          rgb c = aColor;
          // dirty hack finished.

          /*
            Serial.println(String(i) + " R currently " + String(c.r)  + " tweening to " + String(t.r));
            Serial.println(String(i) + " G currently " + String(c.g)  + " tweening to " + String(t.g));
            Serial.println(String(i) + " B currently " + String(c.b)  + " tweening to " + String(t.b));

            Serial.println("Last run " + String(delta) + " ms ago");
          */
          // calculate step color...

          boolean rUp = (t.r - c.r) > 0;
          boolean gUp = (t.g - c.g) > 0;
          boolean bUp = (t.b - c.b) > 0;

          int chunk = round(neoset[i].ttl / delta);
          if (chunk < 1) chunk = 1;

          //Serial.println("Chunk is " + String(chunk) + " TTL is " + String(neoset[i].ttl));
          // red step
          int rS = round((t.r - c.r) / chunk);
          if (rS == 0) {
            rUp ? rS += 1: rS -= 1;
          }
          if (t.r == c.r) rS = 0;

          //Serial.println("Red change " + String(rS));
          //Serial.println("Red diff " + String(t.r - c.r)  + " diff/chunk: " + String((t.r - c.r) / chunk));
          int gS = round((t.g - c.g) / chunk);
          if (gS == 0) {
            gUp ? gS += 1: gS -= 1;
          }
          if (t.g == c.g) gS = 0;

          //Serial.println("Green change " + String(gS));

          int bS = round((t.b - c.b) / chunk);
          if (bS == 0) {
            bUp ? bS += 1: bS -= 1;
          }
          if (t.b == c.b) bS = 0;

          //Serial.println("Blue change " + String(bS));

          int r = c.r + rS;
          int g = c.g + gS;
          int b = c.b + bS;

          pixels.setPixelColor(i, pixels.Color(r, g, b));
          neoset[i].ttl -= delta;
        }

      }

    }
  }


  pixels.show();
}

```
