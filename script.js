
    const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Body, Events } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    const canvas = document.getElementById('world');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
      }
    });

    Render.run(render);
    Engine.run(engine);

    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, {
      isStatic: true,
      render: { visible: false }
    });
    World.add(world, ground);

    const symbols = ['0','1','2','3','4','5','6','7','8','9','+','-','*','%','='];

    const symbolBodies = symbols.map((char, index) => {
      const x = Math.random() * (canvas.width - 100); 
      const y = Math.random() * (canvas.height / 2); 
      const body = Bodies.circle(x, y, 40, {
        restitution: 0.6,
        friction: 0.1,
        label: char,
        render: { visible: false }
      });

      const el = document.createElement('div');
      el.classList.add('symbol');
      el.setAttribute('draggable', 'true');
      el.innerHTML = `${char}`; 
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);

      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("text/plain", char);
      });

      body.htmlEl = el;

      return body;
    });

    World.add(world, symbolBodies);

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    World.add(world, mouseConstraint);

    Events.on(mouseConstraint, 'mousemove', function(event) {
      symbolBodies.forEach(body => {
        const dx = body.position.x - event.mouse.position.x;
        const dy = body.position.y - event.mouse.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.05,
            y: -Math.random() * 0.05
          });
        }
      });
    });

    Events.on(engine, 'afterUpdate', function() {
      symbolBodies.forEach(body => {
        if (body.htmlEl) {
          body.htmlEl.style.left = `${Math.min(Math.max(body.position.x - 20, 0), canvas.width - 60)}px`; // Keeps inside screen
          body.htmlEl.style.top = `${Math.min(Math.max(body.position.y - 20, 0), canvas.height - 60)}px`; // Keeps inside screen
        }
      });
    });

    const dropSound = document.getElementById("dropSound");

    document.querySelectorAll('.drop-container').forEach(container => {
      container.addEventListener('dragover', (e) => e.preventDefault());

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        container.textContent = data;
        dropSound.currentTime = 0;
        dropSound.play();
        checkAndCalculate();
      });
    });

    function checkAndCalculate() {
      const v1 = document.getElementById('container1').textContent.trim();
      const op = document.getElementById('container2').textContent.trim();
      const v2 = document.getElementById('container3').textContent.trim();

      if (v1 && v2 && op && ['+', '-', '*', '%'].includes(op)) {
        let result = '';
        try {
          result = eval(`${v1}${op}${v2}`);
        } catch (err) {
          result = 'Err';
        }
        document.getElementById('container4').textContent = result;
      }
    }
 