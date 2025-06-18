const PARENT_INSTANCE_COUNT = 4;
const CHILD_INSTANCE_COUNT = 4;

class Parent {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'parent';
        document.body.appendChild(this.element);

        this.children = [];

        window.addEventListener('resize', this.onResize.bind(this));
    }

    addChild(clsName) {
        const child = new Child(this, clsName);
        this.children.push(child);
        this.element.appendChild(child.element);
    }

    onResize() {
        this.children.forEach(child => child.updatePositionOnResize());
    }
}

class Child {
    constructor(parentInstance, clsName= 'child') {
        this.parent = parentInstance.element;
        this.element = document.createElement('div');
        this.element.className = clsName;

        this.x = 0;
        this.y = 0;
        this.isDragging = false;
        this.relativeX = 0;
        this.relativeY = 0;

        this.initEvents();
    }

    initEvents() {
        this.element.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.parent.addEventListener('pointermove', this.onPointerMove.bind(this));
        window.addEventListener('pointerup', this.onPointerUp.bind(this));
    }

    onPointerDown(event) {
        this.isDragging = true;
        this.x = event.clientX - this.element.offsetLeft;
        this.y = event.clientY - this.element.offsetTop;
        this.element.setPointerCapture(event.pointerId);
    }

    onPointerMove(event) {
        if (!this.isDragging) return;

        const rect = this.parent.getBoundingClientRect();
        const rectChild = this.element.getBoundingClientRect();

        const newLeft = Math.max(0, Math.min(event.clientX - this.x, rect.width - rectChild.width));
        const newTop = Math.max(0, Math.min(event.clientY - this.y, rect.height - rectChild.height));


        this.element.style.left = `${newLeft}px`;
        this.element.style.top = `${newTop}px`;

        this.relativeX = newLeft / rect.width;
        this.relativeY = newTop / rect.height;
    }

    onPointerUp() {
        this.isDragging = false;
    }

    updatePositionOnResize() {
        const rect = this.parent.getBoundingClientRect();
        const rectChild = this.element.getBoundingClientRect();
        const newLeft = Math.min(this.relativeX * rect.width, rect.width - rectChild.width);
        const newTop = Math.min(this.relativeY * rect.height, rect.height - rectChild.height);

        this.element.style.left = `${newLeft}px`;
        this.element.style.top = `${newTop}px`;
    }
}

const parentInstances = [];
for (let i=0; i<PARENT_INSTANCE_COUNT;i++) {
    parentInstances.push(new Parent());
}
for (let i=0; i< PARENT_INSTANCE_COUNT;i++) {
    for (let j=0;j<CHILD_INSTANCE_COUNT;j++) {
        if (j%2=== 0) {
            parentInstances[i].addChild('child2');
        }else if(j%3==0){

            parentInstances[i].addChild('child3');
        }
        else {
            parentInstances[i].addChild();
        }
    }
}

