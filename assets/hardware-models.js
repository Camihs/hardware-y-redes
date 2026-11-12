/* Biblioteca local de modelos 3D educativos para Hardware y Redes */
(() => {
  "use strict";
  const viewer = document.querySelector("#mv");
  const selector = document.querySelector("#modelSel");
  const info = document.querySelector("#info");
  if (!viewer || !selector) return;

  const rgba = (hex) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1];
  };
  const makeModel = (name, parts) => {
    const pos = [], norm = [], color = [];
    const tri = (a, b, c, col) => {
      const ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2];
      const vx=c[0]-a[0], vy=c[1]-a[1], vz=c[2]-a[2];
      let nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
      const len=Math.hypot(nx,ny,nz)||1; nx/=len; ny/=len; nz/=len;
      for (const p of [a,b,c]) { pos.push(...p); norm.push(nx,ny,nz); color.push(...col); }
    };
    const box = (center, size, hex) => {
      const [x,y,z]=center, [sx,sy,sz]=size, X=sx/2,Y=sy/2,Z=sz/2, c=rgba(hex);
      const faces=[
        [[x-X,y-Y,z+Z],[x+X,y-Y,z+Z],[x+X,y+Y,z+Z],[x-X,y+Y,z+Z]],
        [[x+X,y-Y,z-Z],[x-X,y-Y,z-Z],[x-X,y+Y,z-Z],[x+X,y+Y,z-Z]],
        [[x+X,y-Y,z+Z],[x+X,y-Y,z-Z],[x+X,y+Y,z-Z],[x+X,y+Y,z+Z]],
        [[x-X,y-Y,z-Z],[x-X,y-Y,z+Z],[x-X,y+Y,z+Z],[x-X,y+Y,z-Z]],
        [[x-X,y+Y,z+Z],[x+X,y+Y,z+Z],[x+X,y+Y,z-Z],[x-X,y+Y,z-Z]],
        [[x-X,y-Y,z-Z],[x+X,y-Y,z-Z],[x+X,y-Y,z+Z],[x-X,y-Y,z+Z]]
      ];
      for (const f of faces) { tri(f[0],f[1],f[2],c); tri(f[0],f[2],f[3],c); }
    };
    const cylinder = (center, radius, height, hex, segments=24) => {
      const [x,y,z]=center, c=rgba(hex);
      for(let i=0;i<segments;i++){
        const a=i*Math.PI*2/segments, b=(i+1)*Math.PI*2/segments;
        const p1=[x+Math.cos(a)*radius,y-height/2,z+Math.sin(a)*radius];
        const p2=[x+Math.cos(b)*radius,y-height/2,z+Math.sin(b)*radius];
        const p3=[x+Math.cos(b)*radius,y+height/2,z+Math.sin(b)*radius];
        const p4=[x+Math.cos(a)*radius,y+height/2,z+Math.sin(a)*radius];
        tri(p1,p2,p3,c); tri(p1,p3,p4,c);
        tri([x,y-height/2,z],p2,p1,c);
        tri([x,y+height/2,z],p4,p3,c);
      }
    };
    for (const p of parts) {
      if (p.kind==="cylinder") cylinder(p.at,p.r,p.h,p.color,p.segments);
      else box(p.at,p.size,p.color);
    }
    const pack = (arr) => new Float32Array(arr);
    const arrays=[pack(pos),pack(norm),pack(color)];
    const chunks=[], views=[]; let offset=0;
    for(const arr of arrays){
      const bytes=new Uint8Array(arr.buffer);
      chunks.push(bytes); views.push({buffer:0,byteOffset:offset,byteLength:bytes.byteLength,target:34962});
      offset+=bytes.byteLength;
    }
    const bin=new Uint8Array(offset); let cursor=0;
    for(const chunk of chunks){bin.set(chunk,cursor);cursor+=chunk.length;}
    const count=pos.length/3;
    const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    for(let i=0;i<pos.length;i+=3)for(let j=0;j<3;j++){min[j]=Math.min(min[j],pos[i+j]);max[j]=Math.max(max[j],pos[i+j]);}
    const gltf={
      asset:{version:"2.0",generator:"Hardware y Redes para Todos"},
      scene:0,scenes:[{nodes:[0]}],nodes:[{name,mesh:0}],
      meshes:[{name,primitives:[{attributes:{POSITION:0,NORMAL:1,COLOR_0:2},mode:4}]}],
      materials:[{name:"Material educativo",pbrMetallicRoughness:{metallicFactor:.28,roughnessFactor:.48},doubleSided:true}],
      buffers:[{byteLength:bin.byteLength}],
      bufferViews:views,
      accessors:[
        {bufferView:0,componentType:5126,count,type:"VEC3",min,max},
        {bufferView:1,componentType:5126,count,type:"VEC3"},
        {bufferView:2,componentType:5126,count,type:"VEC4"}
      ]
    };
    const jsonBytes=new TextEncoder().encode(JSON.stringify(gltf));
    const jsonLength=Math.ceil(jsonBytes.length/4)*4, binLength=Math.ceil(bin.length/4)*4;
    const total=12+8+jsonLength+8+binLength, out=new ArrayBuffer(total), dv=new DataView(out);
    dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,total,true);
    dv.setUint32(12,jsonLength,true);dv.setUint32(16,0x4e4f534a,true);
    new Uint8Array(out,20,jsonBytes.length).set(jsonBytes);
    new Uint8Array(out,20+jsonBytes.length,jsonLength-jsonBytes.length).fill(0x20);
    const binHeader=20+jsonLength;dv.setUint32(binHeader,binLength,true);dv.setUint32(binHeader+4,0x004e4942,true);
    new Uint8Array(out,binHeader+8,bin.length).set(bin);
    return URL.createObjectURL(new Blob([out],{type:"model/gltf-binary"}));
  };

  const definitions=[
    {id:"hw-board",name:"Placa base",detail:"La placa base conecta el procesador, la RAM, el almacenamiento y las tarjetas de expansión.",parts:[
      {at:[0,0,0],size:[1.8,.09,1.35],color:"#176b48"},
      {at:[-.25,.09,.05],size:[.48,.035,.48],color:"#d6b45a"},
      {at:[-.25,.12,.05],size:[.34,.08,.34],color:"#29364a"},
      {at:[.48,.09,.18],size:[.12,.05,.72],color:"#d7dce3"},
      {at:[.68,.09,.18],size:[.12,.05,.72],color:"#d7dce3"},
      {at:[-.15,.09,-.52],size:[.95,.05,.12],color:"#202d45"},
      {at:[-.15,.09,-.32],size:[.95,.05,.08],color:"#202d45"},
      {at:[.73,.13,-.52],size:[.22,.18,.3],color:"#b7c3d0"},
      {at:[-.78,.12,.48],size:[.22,.18,.18],color:"#aab5c2"},
      {at:[.48,.12,-.5],size:[.18,.1,.18],color:"#d3a63e"},
      {at:[-.7,.13,-.48],size:[.16,.12,.16],color:"#222b3a"}
    ]},
    {id:"hw-cpu",name:"Procesador (CPU)",detail:"La CPU ejecuta instrucciones y realiza cálculos. Es uno de los componentes principales del computador.",parts:[
      {at:[0,0,0],size:[1.05,.16,1.05],color:"#b7c1cb"},
      {at:[0,.1,0],size:[.72,.08,.72],color:"#26354a"},
      {at:[0,.15,0],size:[.62,.025,.62],color:"#d9e0e8"},
      {at:[0,-.1,0],size:[.94,.035,.94],color:"#c49a3a"},
      ...Array.from({length:7},(_,i)=>({at:[-.36+i*.12,-.13,.49],size:[.045,.04,.08],color:"#e3bd58"})),
      ...Array.from({length:7},(_,i)=>({at:[-.36+i*.12,-.13,-.49],size:[.045,.04,.08],color:"#e3bd58"}))
    ]},
    {id:"hw-ram",name:"Memoria RAM",detail:"La RAM guarda temporalmente los datos y programas que el computador está utilizando.",parts:[
      {at:[0,0,0],size:[1.9,.09,.42],color:"#176b48"},
      {at:[0,.07,0],size:[1.45,.06,.28],color:"#273246"},
      ...Array.from({length:8},(_,i)=>({at:[-.68+i*.195,.12,0],size:[.13,.045,.23],color:i%2?"#8d9aa8":"#bec8d2"})),
      {at:[0,-.06,.19],size:[1.65,.025,.035],color:"#e3bd58"}
    ]},
    {id:"hw-gpu",name:"Tarjeta gráfica (GPU)",detail:"La GPU procesa gráficos, imágenes y video. En muchos equipos se instala en una ranura PCI Express.",parts:[
      {at:[0,0,0],size:[1.8,.18,.68],color:"#263449"},
      {at:[0,.11,0],size:[1.55,.05,.55],color:"#176b48"},
      {at:[-.42,.17,0],kind:"cylinder",r:.24,h:.08,color:"#aeb9c6"},
      {at:[.42,.17,0],kind:"cylinder",r:.24,h:.08,color:"#aeb9c6"},
      {at:[-.42,.22,0],kind:"cylinder",r:.13,h:.04,color:"#273246"},
      {at:[.42,.22,0],kind:"cylinder",r:.13,h:.04,color:"#273246"},
      {at:[-.8,-.02,0],size:[.12,.25,.62],color:"#c5a04b"},
      {at:[.78,.12,0],size:[.2,.13,.22],color:"#d2dae3"}
    ]},
    {id:"hw-ssd",name:"Unidad SSD M.2",detail:"El SSD conserva archivos y programas incluso cuando el computador está apagado. Es almacenamiento permanente.",parts:[
      {at:[0,0,0],size:[1.75,.07,.38],color:"#176b48"},
      {at:[-.22,.06,0],size:[.48,.05,.28],color:"#273246"},
      {at:[.38,.06,0],size:[.28,.05,.25],color:"#b8c3cf"},
      {at:[.72,.06,0],size:[.2,.05,.24],color:"#273246"},
      {at:[-.78,-.01,0],size:[.12,.015,.32],color:"#e2b74f"}
    ]},
    {id:"hw-router",name:"Router Wi-Fi",detail:"El router conecta dispositivos a una red local y dirige el tráfico hacia otras redes, como Internet.",parts:[
      {at:[0,0,0],size:[1.35,.18,.85],color:"#263449"},
      {at:[0,.1,0],size:[1.2,.045,.72],color:"#46566c"},
      {at:[-.48,.52,-.3],size:[.045,.9,.045],color:"#202b3c"},
      {at:[.48,.52,-.3],size:[.045,.9,.045],color:"#202b3c"},
      {at:[-.3,.12,.36],size:[.08,.035,.08],color:"#55c98b"},
      {at:[-.1,.12,.36],size:[.08,.035,.08],color:"#55c98b"},
      {at:[.1,.12,.36],size:[.08,.035,.08],color:"#e6c15a"},
      {at:[.3,.12,.36],size:[.08,.035,.08],color:"#55c98b"},
      {at:[0,-.1,-.4],size:[.75,.08,.08],color:"#aeb9c6"}
    ]},
    {id:"hw-hdd",name:"Disco duro (HDD)",detail:"El disco duro almacena el sistema, los programas y los archivos mediante platos magnéticos que giran a gran velocidad.",parts:[
      {at:[0,0,0],size:[1.55,.24,1.15],color:"#aeb9c6"},
      {at:[0,.13,0],size:[1.38,.035,1.02],color:"#d8dee5"},
      {at:[-.12,.17,0],kind:"cylinder",r:.38,h:.035,color:"#bac5d0"},
      {at:[-.12,.195,0],kind:"cylinder",r:.1,h:.025,color:"#d5ad4c"},
      {at:[.56,.17,-.35],size:[.24,.025,.15],color:"#29384c"},
      {at:[.56,.17,.35],size:[.24,.025,.15],color:"#29384c"}
    ]},
    {id:"hw-psu",name:"Fuente de poder",detail:"La fuente convierte la corriente eléctrica y entrega los voltajes adecuados a los componentes del computador.",parts:[
      {at:[0,0,0],size:[1.45,.72,1.05],color:"#354255"},
      {at:[0,.38,0],size:[1.28,.035,.9],color:"#536176"},
      {at:[0,.41,0],kind:"cylinder",r:.31,h:.045,color:"#aeb9c6"},
      {at:[0,.44,0],kind:"cylinder",r:.23,h:.035,color:"#263449"},
      {at:[-.57,-.05,.48],size:[.18,.28,.08],color:"#c5a04b"},
      {at:[.48,-.05,.48],size:[.18,.28,.08],color:"#c5a04b"}
    ]},
    {id:"hw-nic",name:"Tarjeta de red",detail:"La tarjeta de red permite conectar un computador a una red mediante Ethernet o, según el modelo, conexión inalámbrica.",parts:[
      {at:[0,0,0],size:[1.25,.09,.7],color:"#176b48"},
      {at:[-.35,.08,0],size:[.34,.08,.35],color:"#273449"},
      {at:[.28,.08,0],size:[.34,.08,.35],color:"#aeb9c6"},
      {at:[.55,.08,0],size:[.22,.23,.46],color:"#c5a04b"},
      {at:[-.48,-.04,0],size:[.12,.03,.55],color:"#d9b454"}
    ]},
    {id:"hw-switch",name:"Switch de red",detail:"El switch conecta varios equipos dentro de una misma red local y envía los datos al puerto correspondiente.",parts:[
      {at:[0,0,0],size:[1.8,.28,.8],color:"#354255"},
      {at:[0,.16,0],size:[1.68,.045,.68],color:"#536176"},
      ...Array.from({length:8},(_,i)=>({at:[-.68+i*.195,.2,.3],size:[.12,.12,.12],color:"#d8b35a"})),
      ...Array.from({length:6},(_,i)=>({at:[-.55+i*.22,.2,-.22],size:[.07,.035,.07],color:i%2?"#55c98b":"#e0b84d"}))
    ]},
    {id:"hw-ap",name:"Punto de acceso Wi-Fi",detail:"El punto de acceso ofrece conexión inalámbrica a dispositivos y amplía la cobertura de una red local.",parts:[
      {at:[0,0,0],kind:"cylinder",r:.62,h:.2,color:"#e2e7ec",segments:32},
      {at:[0,.12,0],kind:"cylinder",r:.48,h:.055,color:"#f7f8fa",segments:32},
      {at:[0,.16,0],kind:"cylinder",r:.055,h:.025,color:"#55c98b"},
      {at:[0,-.12,0],kind:"cylinder",r:.22,h:.045,color:"#b7c2ce"}
    ]},
    {id:"hw-ethernet",name:"Cable Ethernet RJ45",detail:"El cable Ethernet transporta datos entre equipos de red. Sus conectores RJ45 se insertan en puertos de red.",parts:[
      {at:[-.58,0,0],size:[.42,.16,.2],color:"#d8b35a"},
      {at:[-.83,0,0],size:[.12,.2,.22],color:"#b7c2ce"},
      {at:[-.98,0,0],size:[.06,.1,.16],color:"#e4c56d"},
      {at:[.42,0,0],size:[.85,.09,.09],color:"#263449"},
      {at:[.88,0,0],size:[.22,.16,.2],color:"#d8b35a"},
      {at:[1.02,0,0],size:[.1,.2,.22],color:"#b7c2ce"}
    ]}
  ];
  for(const model of definitions) urls.set(model.id,makeModel(model.name,model.parts));

  const gallery=document.createElement("section");
  gallery.className="hardware-gallery";
  gallery.id="hardware-gallery";
  gallery.setAttribute("aria-labelledby","hardware-gallery-title");
  gallery.innerHTML='<div class="hardware-gallery-head"><div><h3 id="hardware-gallery-title">Biblioteca de modelos 3D</h3><p>Elige una pieza para verla de cerca, girarla y explorar su forma.</p></div><span class="hardware-count">'+definitions.length+' modelos</span></div><div class="hardware-model-grid"></div>';
  const grid=gallery.querySelector(".hardware-model-grid");
  for(const model of definitions){
    const button=document.createElement("button");
    button.type="button";button.className="hardware-model-card";button.dataset.model=model.id;
    button.innerHTML='<span class="hardware-model-icon" aria-hidden="true">'+({ "hw-board":"▦","hw-cpu":"▣","hw-ram":"▤","hw-gpu":"▰","hw-ssd":"▱","hw-router":"⌁"}[model.id])+'</span><span class="hardware-model-name"></span><span class="hardware-model-detail"></span><span class="hardware-model-action">Explorar modelo →</span>';
    button.querySelector(".hardware-model-name").textContent=model.name;
    button.querySelector(".hardware-model-detail").textContent=model.detail;
    button.addEventListener("click",()=>selectHardware(model.id));
    grid.append(button);
  }
  const infoParent=info?.parentNode;
  if(infoParent)infoParent.insertBefore(gallery,info.nextSibling);
  for(const model of definitions){
    window.__hyrRegisterHardwareModel?.({id:model.id,name:model.name,src:urls.get(model.id)});
  }
  const updateCards=(id)=>{
    gallery.querySelectorAll(".hardware-model-card").forEach(card=>{
      const active=card.dataset.model===id;
      card.classList.toggle("active",active);
      card.setAttribute("aria-pressed",String(active));
    });
  };
  function selectHardware(id){
    const model=definitions.find(item=>item.id===id);if(!model)return;
    window.__hyrSelectHardwareModel?.(id);
    selector.value=id;
    viewer.alt="Modelo 3D educativo: "+model.name;
    viewer.cameraOrbit="auto auto auto";
    viewer.fieldOfView="auto";
    viewer.autoRotate=true;
    document.querySelector("#tRot")?.setAttribute("aria-pressed","true");
    if(info)info.textContent=model.name+". "+model.detail+" Arrastra el modelo para girarlo y usa los controles para acercarlo.";
    updateCards(id);
  }

  viewer.addEventListener("load",()=>document.querySelector("#ovLoad")?.classList.remove("on"));
  window.addEventListener("beforeunload",()=>urls.forEach(url=>URL.revokeObjectURL(url)));
  window.HardwareModelLibrary={models:definitions.map(({id,name,detail})=>({id,name,detail})),select:selectHardware};
  // Selección inicial para que el menú tenga una primera alternativa lista.
  updateCards("");
})();