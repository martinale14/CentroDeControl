#include <ArduinoHttpClient.h>
#include <LedControl.h>
#include <ESP8266WiFi.h>

const int MQ_PIN = A0;      // Pin del sensor
const int RL_VALUE = 20;      // Resistencia RL del modulo en Kilo ohms
const int R0 = 5;          // Resistencia R0 del sensor en Kilo ohms RS/R0 = 3.6ppm
 
// Datos para lectura multiple
const int READ_SAMPLE_INTERVAL = 100;    // Tiempo entre muestras
const int READ_SAMPLE_TIMES = 5;       // Numero muestras
 
// Ajustar estos valores para vuestro sensor según el Datasheet
// (opcionalmente, según la calibración que hayáis realizado)
const float X0 = 10;
const float Y0 = 2.2;
const float X1 = 200;
const float Y1 = 0.8;
 
// Puntos de la curva de concentración {X, Y}
const float punto0[] = { log10(X0), log10(Y0) };
const float punto1[] = { log10(X1), log10(Y1) };
 
// Calcular pendiente y coordenada abscisas
const float scope = (punto1[1] - punto0[1]) / (punto1[0] - punto0[0]);
const float coord = punto0[1] - punto0[0] * scope;
float ppm = 0;

int currentTime = 0;
int reference = 0;
int interval = 20000;

LedControl matriz = LedControl(14, 13, 12, 1);
const int buzPin = 0;
const int trigPin = 16;
const int echoPin = 5;

float distancia;
const char* ssid = "ANA-LUCIA";
const char* password = "66786238*";

byte buena[] = {

  B00000000,
  B00000010,
  B00000100,
  B00001000,
  B01010000,
  B01100000,
  B01000000,
  B00000000

};

byte mala[] = {

  B00000000,
  B01000010,
  B00100100,
  B00011000,
  B00011000,
  B00100100,
  B01000010,
  B00000000

};

void setup(){

  Serial.begin(9600);

  conectarWifi();

  pinMode(buzPin, OUTPUT);  
 
  pinMode(trigPin, OUTPUT); //pin como salida
  pinMode(echoPin, INPUT);  //pin como entrada
   
  digitalWrite(trigPin, LOW); //Limpiamos la salida del pulso

  matriz.shutdown(0,false);
  matriz.setIntensity(0,8);
  matriz.clearDisplay(0);
 
  }

void loop(){

  //Obtenemos las particulas por millon 
  float rs_med = readMQ(MQ_PIN);      // Obtener la Rs promedio
  ppm = getConcentration(rs_med/R0);   // Obtener la concentración

  if(ppm >= 1000){

      ppm = 1000;
    
    }
   
   // Mostrar el valor de la concentración por serial
   Serial.println("Concentración: ");
   Serial.println(String(ppm));
  //Calculamos la distancia del objeto mas cercano
  distancia = getDistance();

  if(distancia <= 200){

      if(ppm > 200){

        digitalWrite(buzPin, HIGH);
        representar(mala, 5000);
        
      }else{
        
        digitalWrite(buzPin, LOW);
        representar(buena, 5000);
        
      }
      
  }else{
    
    matriz.clearDisplay(0);
    digitalWrite(buzPin, LOW);
    
  }

  if(currentTime >= reference){

    reference += interval;
    uploadData(ppm);
    
  }

  currentTime = millis();

}

void representar(byte *Datos,int retardo) {
 
  for (int i = 0; i < 8; i++) {
 
    matriz.setColumn(0,i,Datos[7-i]);
 
  }

}

float getDistance() {

  long duracion;
  float dis;
  
  //Enviamos un Pulso
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  //Calculamos el tiempo que se demoro en volver el pulso
  duracion = pulseIn(echoPin, HIGH)/2;

  dis = duracion*0.0344;

  Serial.println(dis);

  return dis; 
  
}

void conectarWifi() {
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Conectando a:\t");
  Serial.println(ssid); 

  // Esperar a que nos conectemos
  while (WiFi.status() != WL_CONNECTED) 
  {
    delay(200);
    Serial.print('.');
  }
 
  // Mostrar mensaje de exito y dirección IP asignada
  Serial.println();
  Serial.print("Conectado a:\t");
  Serial.println(WiFi.SSID()); 
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());
  
}

void uploadData(float ppm){

  if(WiFi.status()==WL_CONNECTED){
    
    char serverAddress[] = "54.173.63.211";
    int port = 3000;
    
    WiFiClient wifi;
    HttpClient http = HttpClient(wifi, serverAddress, port);

    String contentType = "application/x-www-form-urlencoded";
    String postData = "modulo=1&ppm=" + String(ppm);

    http.post("/upload", contentType, postData);
    
  } 
  
}

// Obtener la resistencia promedio en N muestras
float readMQ(int mq_pin)
{
   float rs = 0;
   for (int i = 0;i<READ_SAMPLE_TIMES;i++) {
      rs += getMQResistance(analogRead(mq_pin));
      delay(READ_SAMPLE_INTERVAL);
   }
   return rs / READ_SAMPLE_TIMES;
}
 
// Obtener resistencia a partir de la lectura analogica
float getMQResistance(int raw_adc)
{
  if(raw_adc >= 1023 ){

      raw_adc = 1022;
    
    }
   return (((float)RL_VALUE / 1000.0*(1023 - raw_adc) / raw_adc));
}
 
// Obtener concentracion 10^(coord + scope * log (rs/r0)
float getConcentration(float rs_ro_ratio)
{
   return pow(10, coord + scope * log(rs_ro_ratio));
}
 
