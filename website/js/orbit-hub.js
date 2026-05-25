/**
 * Parkar Orbit Hub — Solution page visual
 * Usage: <div class="orbit-hub" data-active="data"></div>
 * data-active: agentic | data | apps | cloud | itops
 * Pure visual — no clicks, no navigation
 */
(function(){
  var TEAL='#00C4A7';
  var TEAL_GLOW='rgba(0,196,167,';
  var TEAL_RIM='rgba(0,220,190,0.9)';

  const SERVICES=[
    {id:'agentic',label:'Agentic AI',short:'Agentic AI',words:['Autonomous','Purposeful','Connected','Adaptive','Governed','Proactive','Intelligent','Accountable']},
    {id:'data',label:'Data',short:'Data',words:['Trusted','Governed','Connected','Accurate','Accessible','Scalable','Structured','Observable']},
    {id:'apps',label:'Applications',short:'Apps',words:['Modern','Composable','Integrated','Scalable','Maintainable','Performant','Secure','Cloud-native']},
    {id:'cloud',label:'Cloud',short:'Cloud',words:['Scalable','Secure','Elastic','Governed','Optimised','Portable','Resilient','Multi-cloud']},
    {id:'itops',label:'IT Operations',short:'IT Ops',words:['Resilient','Automated','Proactive','Governed','Observable','Responsive','Streamlined','Reliable']}
  ];

  document.querySelectorAll('.orbit-hub').forEach(function(host){
    var activeId=host.getAttribute('data-active')||'';
    var activeIdx=SERVICES.findIndex(function(s){return s.id===activeId;});
    if(activeIdx===-1) activeIdx=0;

    host.style.position='relative';
    host.style.width='100%';
    host.style.height='100%';
    host.style.minHeight='600px';
    host.style.overflow='visible';

    var canvas=document.createElement('canvas');
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;cursor:default;';
    host.appendChild(canvas);

    // Load Parkar logo
    var logoImg=new Image();
    logoImg.crossOrigin='anonymous';
    logoImg.src='/assets/Parkar_logo.png';
    var logoReady=false;
    logoImg.onload=function(){logoReady=true;};

    var ctx=canvas.getContext('2d');
    var W,H,cx,cy,dpr=Math.min(window.devicePixelRatio||1,2);
    var frame=0;
    var orbitAngle=0;
    var ORBIT_SPEED=0.0015;
    var NODE_R,CENTER_R,ORBIT_R;

    // Floating word particles for center
    var wordParticles=[];
    function initParticles(){
      wordParticles=[];
      var s=SERVICES[activeIdx];
      s.words.forEach(function(w,i){
        var angle=(i/s.words.length)*Math.PI*2 + Math.random()*0.3;
        var dist=CENTER_R*0.55 + Math.random()*CENTER_R*0.3;
        wordParticles.push({
          text:w,
          baseAngle:angle,
          baseDist:dist,
          speed:0.0004+Math.random()*0.0006,
          bobSpeed:0.008+Math.random()*0.008,
          bobAmp:3+Math.random()*4,
          phase:Math.random()*Math.PI*2,
          alphaBase:0.3+Math.random()*0.25
        });
      });
    }

    function resize(){
      W=host.clientWidth; H=host.clientHeight;
      cx=W/2; cy=H/2;
      canvas.width=W*dpr; canvas.height=H*dpr;
      canvas.style.width=W+'px'; canvas.style.height=H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var base=Math.min(W,H);
      NODE_R=base*0.09;
      CENTER_R=base*0.15;
      ORBIT_R=base*0.30;
      if(!wordParticles.length) initParticles();
    }

    function getPositions(){
      return SERVICES.map(function(_,i){
        var a=orbitAngle+(i/SERVICES.length)*Math.PI*2 - Math.PI/2;
        return {x:cx+Math.cos(a)*ORBIT_R, y:cy+Math.sin(a)*ORBIT_R};
      });
    }

    function drawBg(){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<40;i++){
        var sx=(Math.sin(i*547.3)*0.5+0.5)*W;
        var sy=(Math.cos(i*312.7)*0.5+0.5)*H;
        var twinkle=Math.sin(frame*0.012+i*2.3)*0.5+0.5;
        ctx.beginPath();
        ctx.arc(sx,sy,twinkle*1.2+0.5,0,Math.PI*2);
        ctx.fillStyle='rgba(150,200,255,'+(0.03+twinkle*0.04)+')';
        ctx.fill();
      }
    }

    function drawOrbitRing(){
      // dashed orbit with rotating dash offset
      ctx.save();
      ctx.beginPath(); ctx.arc(cx,cy,ORBIT_R,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.04)';
      ctx.lineWidth=0.6;
      ctx.setLineDash([4,8]);
      ctx.lineDashOffset=-frame*0.3;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    function drawConnectors(pos){
      pos.forEach(function(p,i){
        var isAct=activeIdx===i;
        var grd=ctx.createLinearGradient(cx,cy,p.x,p.y);
        if(isAct){
          var pulse=Math.sin(frame*0.04)*0.12+0.5;
          grd.addColorStop(0,TEAL_GLOW+pulse*0.7+')');
          grd.addColorStop(0.5,TEAL_GLOW+pulse*0.3+')');
          grd.addColorStop(1,TEAL_GLOW+'0.03)');
        } else {
          grd.addColorStop(0,'rgba(255,255,255,0.03)');
          grd.addColorStop(1,'rgba(255,255,255,0.006)');
        }
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y);
        ctx.strokeStyle=grd; ctx.lineWidth=isAct?1:0.3; ctx.stroke();

        // traveling dot on active
        if(isAct){
          var dist=Math.sqrt((p.x-cx)*(p.x-cx)+(p.y-cy)*(p.y-cy));
          var t=((frame*1.2)%dist)/dist;
          var dx=cx+(p.x-cx)*t, dy=cy+(p.y-cy)*t;
          ctx.beginPath(); ctx.arc(dx,dy,2.5,0,Math.PI*2);
          ctx.fillStyle=TEAL_RIM; ctx.globalAlpha=0.9; ctx.fill();
          ctx.globalAlpha=1;
          // second dot offset
          var t2=((frame*1.2+dist*0.5)%dist)/dist;
          var dx2=cx+(p.x-cx)*t2, dy2=cy+(p.y-cy)*t2;
          ctx.beginPath(); ctx.arc(dx2,dy2,1.5,0,Math.PI*2);
          ctx.fillStyle=TEAL_GLOW+'0.5)'; ctx.fill();
        }
      });
    }

    function drawCenter(){
      var s=SERVICES[activeIdx];
      var pulse=Math.sin(frame*0.02)*0.5+0.5;

      // outer glow
      var g=ctx.createRadialGradient(cx,cy,0,cx,cy,CENTER_R*2.5);
      g.addColorStop(0,TEAL_GLOW+(0.1+pulse*0.05)+')');
      g.addColorStop(1,TEAL_GLOW+'0)');
      ctx.beginPath(); ctx.arc(cx,cy,CENTER_R*2.5,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();

      // subtle expanding rings
      for(var i=3;i>0;i--){
        var ringPulse=((frame*0.5+i*40)%120)/120;
        ctx.beginPath(); ctx.arc(cx,cy,CENTER_R+ringPulse*30,0,Math.PI*2);
        ctx.strokeStyle='rgba(0,196,167,'+(0.04*(1-ringPulse))+')';
        ctx.lineWidth=0.5; ctx.stroke();
      }

      // body
      var body=ctx.createRadialGradient(cx-CENTER_R*0.15,cy-CENTER_R*0.2,CENTER_R*0.05,cx,cy,CENTER_R);
      body.addColorStop(0,'rgba(25,30,55,0.98)');
      body.addColorStop(0.5,'rgba(12,16,34,0.99)');
      body.addColorStop(1,'rgba(6,8,18,1)');
      ctx.beginPath(); ctx.arc(cx,cy,CENTER_R,0,Math.PI*2);
      ctx.fillStyle=body; ctx.fill();

      // teal rim with glow
      ctx.save();
      ctx.shadowColor=TEAL;
      ctx.shadowBlur=12+pulse*6;
      ctx.beginPath(); ctx.arc(cx,cy,CENTER_R,0,Math.PI*2);
      ctx.strokeStyle=TEAL_RIM; ctx.lineWidth=1.2; ctx.stroke();
      ctx.restore();

      // glass sheen
      var sh=ctx.createRadialGradient(cx-CENTER_R*0.2,cy-CENTER_R*0.25,0,cx,cy,CENTER_R*0.5);
      sh.addColorStop(0,'rgba(255,255,255,0.06)'); sh.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(cx,cy,CENTER_R,0,Math.PI*2);
      ctx.fillStyle=sh; ctx.fill();

      // Parkar logo at center
      if(logoReady){
        var logoH=CENTER_R*0.28;
        var logoW=logoH*(logoImg.naturalWidth/logoImg.naturalHeight);
        ctx.globalAlpha=0.7;
        ctx.drawImage(logoImg,cx-logoW/2,cy-logoH/2,logoW,logoH);
        ctx.globalAlpha=1;
      }


    }

    function drawNodes(pos){
      pos.forEach(function(p,i){
        var s=SERVICES[i];
        var isAct=activeIdx===i;
        var sc=isAct?1.15:1;
        var r=NODE_R*sc;

        // glow for active
        if(isAct){
          var g=ctx.createRadialGradient(p.x,p.y,r*0.3,p.x,p.y,r*2.2);
          g.addColorStop(0,TEAL_GLOW+'0.2)');
          g.addColorStop(1,TEAL_GLOW+'0)');
          ctx.beginPath(); ctx.arc(p.x,p.y,r*2.2,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill();

          // double pulse ring
          var pulse=Math.sin(frame*0.035)*0.5+0.5;
          ctx.beginPath(); ctx.arc(p.x,p.y,r+4+pulse*4,0,Math.PI*2);
          ctx.strokeStyle=TEAL_GLOW+(0.12+pulse*0.1)+')';
          ctx.lineWidth=0.6; ctx.stroke();

          var pulse2=Math.sin(frame*0.025+1)*0.5+0.5;
          ctx.beginPath(); ctx.arc(p.x,p.y,r+10+pulse2*6,0,Math.PI*2);
          ctx.strokeStyle=TEAL_GLOW+(0.04+pulse2*0.04)+')';
          ctx.lineWidth=0.3; ctx.stroke();
        }

        // body
        var body=ctx.createRadialGradient(p.x-r*0.15,p.y-r*0.18,r*0.05,p.x,p.y,r);
        body.addColorStop(0,isAct?'rgba(30,36,60,0.99)':'rgba(18,22,42,0.97)');
        body.addColorStop(1,isAct?'rgba(8,10,22,1)':'rgba(6,8,16,0.98)');
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
        ctx.fillStyle=body; ctx.fill();

        // rim with glow on active
        if(isAct){
          ctx.save();
          ctx.shadowColor=TEAL;
          ctx.shadowBlur=10;
          ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
          ctx.strokeStyle=TEAL_RIM; ctx.lineWidth=1.2; ctx.stroke();
          ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
          ctx.strokeStyle='rgba(255,255,255,0.08)';
          ctx.lineWidth=0.4; ctx.stroke();
        }

        // sheen
        var sh=ctx.createRadialGradient(p.x-r*0.15,p.y-r*0.18,0,p.x,p.y,r*0.45);
        sh.addColorStop(0,'rgba(255,255,255,0.06)'); sh.addColorStop(1,'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
        ctx.fillStyle=sh; ctx.fill();

        // label
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='rgba(255,255,255,'+(isAct?1:0.4)+')';
        var words=s.short.split(' ');
        if(words.length===1){
          ctx.font='500 '+r*0.34+'px "Aeonik", "Inter", sans-serif';
          ctx.fillText(s.short,p.x,p.y);
        } else {
          ctx.font='500 '+r*0.28+'px "Aeonik", "Inter", sans-serif';
          ctx.fillText(words[0],p.x,p.y-r*0.14);
          ctx.fillText(words.slice(1).join(' '),p.x,p.y+r*0.14);
        }
      });
    }

    function loop(){
      frame++;
      orbitAngle+=ORBIT_SPEED;
      ctx.clearRect(0,0,W,H);
      drawBg();
      var pos=getPositions();
      drawOrbitRing();
      drawConnectors(pos);
      drawCenter();
      drawNodes(pos);
      requestAnimationFrame(loop);
    }

    var ro=new ResizeObserver(resize);
    ro.observe(host);
    resize();
    loop();
  });
})();
