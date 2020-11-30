#include <Arduino_JSON.h>
#include <ESP8266WiFi.h>
#include <ArduinoHttpClient.h>
#include <LedControlMS.h>
#include <MQ135.h>

#define ANALOGPIN A0
#define RZERO 206 

int currentTime = 0;

MQ135 gasSensor = MQ135(ANALOGPIN);
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
  float ppm = gasSensor.getPPM();

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

  if((currentTime % 300000) == 0){
    
    uploadData(ppm);
    
  }

  currentTime = millis();

  Serial.println(ppm);
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
    
    char serverAddress[] = "52.87.255.19";
    int port = 3000;
    
    WiFiClient wifi;
    HttpClient http = HttpClient(wifi, serverAddress, port);

    String contentType = "application/x-www-form-urlencoded";
    String postData = "modulo=1&ppm=" + String(ppm);

    http.post("/upload", contentType, postData);
    
  } 
  
}
 
