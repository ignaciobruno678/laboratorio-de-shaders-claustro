/*{
    "CREDIT": "c.l.a.u.s.t.r.o",
    "DESCRIPTION": "Relampago laser de A a B con quiebres deterministas, trim manual y seis recorridos de luz preconfigurados.",
    "TAGS": "laser,lightning,relampago,trim,path,electric,storm",
    "VSN": "1.0",
    "INPUTS": [
        {"LABEL":"Trazo/Salida X","NAME":"mat_startX","TYPE":"float","MIN":-1,"MAX":1,"DEFAULT":-0.72},
        {"LABEL":"Trazo/Salida Y","NAME":"mat_startY","TYPE":"float","MIN":-1,"MAX":1,"DEFAULT":0.62},
        {"LABEL":"Trazo/Destino X","NAME":"mat_endX","TYPE":"float","MIN":-1,"MAX":1,"DEFAULT":0.68},
        {"LABEL":"Trazo/Destino Y","NAME":"mat_endY","TYPE":"float","MIN":-1,"MAX":1,"DEFAULT":-0.62},
        {"LABEL":"Trazo/Escala","NAME":"mat_scale","TYPE":"float","MIN":0.1,"MAX":2,"DEFAULT":1},
        {"LABEL":"Trazo/Quiebres","NAME":"mat_breakCount","TYPE":"long","VALUES":[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],"LABELS":["2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32"],"DEFAULT":14},
        {"LABEL":"Trazo/Apertura de quiebres","NAME":"mat_jaggedness","TYPE":"float","MIN":0,"MAX":0.8,"DEFAULT":0.16},
        {"LABEL":"Trazo/Detalle electrico","NAME":"mat_detail","TYPE":"float","MIN":0,"MAX":0.12,"DEFAULT":0.035},
        {"LABEL":"Trazo/Curvatura amplia","NAME":"mat_curvature","TYPE":"float","MIN":-0.8,"MAX":0.8,"DEFAULT":0},
        {"LABEL":"Trazo/Cantidad de pliegues","NAME":"mat_foldCount","TYPE":"long","VALUES":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],"LABELS":["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"],"DEFAULT":0},
        {"LABEL":"Trazo/Superficie de pliegues","NAME":"mat_foldAmount","TYPE":"float","MIN":0,"MAX":0.7,"DEFAULT":0},
        {"LABEL":"Trazo/Semilla","NAME":"mat_seed","TYPE":"float","MIN":0,"MAX":100,"DEFAULT":17},
        {"LABEL":"Mirrors/Cantidad de figuras","NAME":"mat_mirrorCount","TYPE":"long","VALUES":[1,2,4],"LABELS":["1 Original","2 Horizontal","4 Horizontal + Vertical"],"DEFAULT":1},
        {"LABEL":"Trim/Inicio","NAME":"mat_trimStart","TYPE":"float","MIN":0,"MAX":1,"DEFAULT":0},
        {"LABEL":"Trim/Fin","NAME":"mat_trimEnd","TYPE":"float","MIN":0,"MAX":1,"DEFAULT":0.28},
        {"LABEL":"Trim/Recorrido manual","NAME":"mat_offset","TYPE":"float","MIN":-2,"MAX":2,"DEFAULT":0},
        {"LABEL":"Trim/Vueltas automaticas","NAME":"mat_travel","TYPE":"long","VALUES":[0,1,2,3,4],"LABELS":["0","1","2","3","4"],"DEFAULT":1},
        {"LABEL":"Trim/Suavidad","NAME":"mat_softness","TYPE":"float","MIN":0.001,"MAX":0.15,"DEFAULT":0.012},
        {"LABEL":"Animacion/Recorrido de luz","NAME":"mat_motionPreset","TYPE":"long","VALUES":[0,1,2,3,4,5,6],"LABELS":["Manual","Flash","Descarga","Latigazo","Pulso","Tormenta","Caudal"],"DEFAULT":6},
        {"LABEL":"Animacion/Duracion","NAME":"mat_duration","TYPE":"float","MIN":0.15,"MAX":12,"DEFAULT":4.8},
        {"LABEL":"Animacion/Velocidad","NAME":"mat_speed","TYPE":"float","MIN":0,"MAX":5,"DEFAULT":1},
        {"LABEL":"Animacion/Elasticidad manual","NAME":"mat_elasticAmount","TYPE":"float","MIN":0,"MAX":1,"DEFAULT":0.65},
        {"LABEL":"Animacion/Frecuencia manual","NAME":"mat_elasticFrequency","TYPE":"float","MIN":0.5,"MAX":10,"DEFAULT":4.2},
        {"LABEL":"Animacion/Amortiguacion manual","NAME":"mat_elasticDamping","TYPE":"float","MIN":0.5,"MAX":14,"DEFAULT":4.5},
        {"LABEL":"Color/Figura 1","NAME":"mat_color","TYPE":"color","DEFAULT":[0.847059,0.929412,1,1],"FLAGS":["no_alpha"]},
        {"LABEL":"Color/Figura 2","NAME":"mat_color2","TYPE":"color","DEFAULT":[0.282353,0.721569,1,1],"FLAGS":["no_alpha"]},
        {"LABEL":"Color/Figura 3","NAME":"mat_color3","TYPE":"color","DEFAULT":[0.545098,0.360784,0.964706,1],"FLAGS":["no_alpha"]},
        {"LABEL":"Color/Figura 4","NAME":"mat_color4","TYPE":"color","DEFAULT":[1,0.301961,0.552941,1],"FLAGS":["no_alpha"]},
        {"LABEL":"Color/Brillo","NAME":"mat_brightness","TYPE":"float","MIN":0,"MAX":2,"DEFAULT":1}
    ],
    "GENERATORS": [
        {"NAME":"mat_time","TYPE":"time_base","PARAMS":{"speed":"mat_speed","speed_curve":1,"link_speed_to_global_bpm":false}}
    ],
    "RENDER_SETTINGS": {"POINT_COUNT":2240}
}*/

#define MAX_MIRRORS 4
#define POINTS_PER_FIGURE 560
#define PI 3.14159265358979323846

float sat(float x) { return clamp(x, 0.0, 1.0); }
float smoother(float x) { x = sat(x); return x*x*x*(x*(x*6.0-15.0)+10.0); }
float hash1(float n) { return fract(sin(n*127.1+311.7)*43758.5453123); }
float signedHash(float n) { return hash1(n)*2.0-1.0; }

vec2 lightningPoint(float t, float currentSeed)
{
    vec2 a = vec2(mat_startX, mat_startY);
    vec2 rawB = vec2(mat_endX, mat_endY);
    vec2 b = a + (rawB-a)*mat_scale;
    vec2 delta = b-a;
    float lengthAB = max(length(delta), 0.0001);
    vec2 perpendicular = vec2(-delta.y, delta.x)/lengthAB;
    int breaks = clamp(mat_breakCount, 2, 32);
    float breaksF = float(breaks);
    float segmentValue = sat(t)*breaksF;
    int segment = min(int(floor(segmentValue)), breaks-1);
    float localT = t >= 1.0 ? 1.0 : fract(segmentValue);
    float segmentF = float(segment);
    float seed = currentSeed*13.17;
    float ta = segmentF/breaksF;
    float tb = (segmentF+1.0)/breaksF;
    float envelopeA = sin(PI*sat(ta));
    float envelopeB = sin(PI*sat(tb));
    float offsetA = 0.0;
    float offsetB = 0.0;
    if(segment > 0) {
        offsetA = signedHash(seed+segmentF*19.31)*mat_jaggedness*envelopeA;
        offsetA += signedHash(seed*2.3+segmentF*41.7)*mat_detail*envelopeA;
    }
    if(segment+1 < breaks) {
        offsetB = signedHash(seed+(segmentF+1.0)*19.31)*mat_jaggedness*envelopeB;
        offsetB += signedHash(seed*2.3+(segmentF+1.0)*41.7)*mat_detail*envelopeB;
    }
    float offset = mix(offsetA, offsetB, localT);
    float pathEnvelope = sin(PI*sat(t));
    offset += signedHash(seed+segmentF*7.9+91.0)*mat_detail*sin(localT*PI)*pathEnvelope;
    offset += mat_curvature*pathEnvelope;
    int folds = clamp(mat_foldCount, 0, 16);
    if(folds > 0) {
        float foldPhase = fract(currentSeed*0.173)*0.5;
        float foldPosition = fract(t*float(folds)+foldPhase);
        float triangle = 1.0-4.0*abs(foldPosition-0.5);
        offset += triangle*mat_foldAmount*pathEnvelope;
    }
    return mix(a, b, sat(t)) + perpendicular*offset;
}

void presetValues(out float trimStart, out float trimEnd, out float elasticAmount, out float elasticFrequency, out float elasticDamping)
{
    trimStart = mat_trimStart;
    trimEnd = mat_trimEnd;
    elasticAmount = mat_elasticAmount;
    elasticFrequency = mat_elasticFrequency;
    elasticDamping = mat_elasticDamping;
    if(mat_motionPreset == 1) { trimStart=0.0; trimEnd=0.72; elasticAmount=0.08; elasticFrequency=2.0; elasticDamping=8.0; }
    if(mat_motionPreset == 2) { trimStart=0.0; trimEnd=0.28; elasticAmount=0.65; elasticFrequency=4.2; elasticDamping=4.5; }
    if(mat_motionPreset == 3) { trimStart=0.0; trimEnd=0.12; elasticAmount=0.35; elasticFrequency=2.5; elasticDamping=7.0; }
    if(mat_motionPreset == 4) { trimStart=0.0; trimEnd=0.42; elasticAmount=0.18; elasticFrequency=1.5; elasticDamping=3.5; }
    if(mat_motionPreset == 5) { trimStart=0.0; trimEnd=0.08; elasticAmount=0.9; elasticFrequency=8.0; elasticDamping=2.4; }
    if(mat_motionPreset == 6) { trimStart=0.0; trimEnd=0.34; elasticAmount=0.0; elasticFrequency=1.0; elasticDamping=12.0; }
}

float motionProgress()
{
    float p = fract(mat_time/max(mat_duration, 0.001));
    float base = p;
    if(mat_motionPreset == 1) base = 1.0-pow(1.0-p, 3.0);
    if(mat_motionPreset == 2) base = smoother(p);
    if(mat_motionPreset == 3) base = p < 0.5 ? 4.0*p*p*p : 1.0-pow(-2.0*p+2.0, 3.0)/2.0;
    if(mat_motionPreset == 4) base = smoother(p)+sin(p*PI*2.0)*0.035*sin(p*PI);
    if(mat_motionPreset == 5) base = p+sin(p*PI*12.0)*0.035*sin(p*PI);
    float trimStart, trimEnd, amount, frequency, damping;
    presetValues(trimStart, trimEnd, amount, frequency, damping);
    float spring = sin(p*PI*frequency)*exp(-p*damping)*sin(p*PI);
    return base + spring*amount*0.2;
}

float trimMask(float t, float startValue, float endValue)
{
    if(abs(endValue-startValue) >= 0.999) return 1.0;
    float softness = mat_motionPreset == 6
        ? max(mat_softness, 0.045)
        : max(mat_softness, 0.0001);
    float s = fract(startValue+10.0);
    float e = fract(endValue+10.0);
    float v = fract(t+10.0);
    if(s <= e) {
        return smoothstep(s-softness, s+softness, v) * (1.0-smoothstep(e-softness, e+softness, v));
    }
    return max(smoothstep(s-softness, s+softness, v), 1.0-smoothstep(e-softness, e+softness, v));
}

void laserMaterialFunc(int pointNumber, int pointCount, out vec2 pos, out vec4 color, out int shapeNumber, out vec4 userData)
{
    int mirrorIndex = pointNumber/POINTS_PER_FIGURE;
    int localPoint = pointNumber-mirrorIndex*POINTS_PER_FIGURE;
    int mirrorCount = clamp(mat_mirrorCount, 1, MAX_MIRRORS);
    if(mirrorIndex >= mirrorCount) {
        pos = vec2(0.0);
        color = vec4(0.0);
        shapeNumber = -1;
        userData = vec4(0.0);
        return;
    }

    float t = float(localPoint)/float(POINTS_PER_FIGURE-1);
    pos = lightningPoint(t, mat_seed);
    if(mirrorIndex == 1 || mirrorIndex == 3) pos.x = -pos.x;
    if(mirrorIndex >= 2) pos.y = -pos.y;
    float trimStart, trimEnd, amount, frequency, damping;
    presetValues(trimStart, trimEnd, amount, frequency, damping);
    float animatedOffset = mat_offset + motionProgress()*float(mat_travel);
    float brightness = trimMask(fract(t-animatedOffset+20.0), trimStart, trimEnd)*mat_brightness;
    vec3 pointColor = mat_color.rgb;
    if(mirrorIndex == 1) pointColor = mat_color2.rgb;
    if(mirrorIndex == 2) pointColor = mat_color3.rgb;
    if(mirrorIndex == 3) pointColor = mat_color4.rgb;
    color = vec4(pointColor*brightness, 1.0);
    shapeNumber = mirrorIndex;
    userData = vec4(t, motionProgress(), float(mirrorIndex)/3.0, brightness);
}
