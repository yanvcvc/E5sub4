import { gsap } from "https://cdn.skypack.dev/gsap@3.12.2";

/*
Made by Dale de Silva
designdebt.club
twitter: @daledesilva
*/

const OPEN_STATE = 'open';
const OPENING_STATE = 'opening';
const CLOSED_STATE = 'closed';
const CLOSING_STATE = 'closing';

const OPEN_START = 0;
const OPEN_LOOPSTART = 0.32 * 1000;
const OPEN_LOOPEND = 0.47 * 1000;

const CLOSE_START = 0.47 * 1000;
const CLOSE_END = 0.80 * 1000;

// These shift the teeth position at the start of the animation so it looks like they're coming out of the mouth. For some reason I couldn't get them perfect without fudging.
const MOUTH_POS_Y_FUDGE = 50;
const MOUTH_POS_X_FUDGE = -30;
const FEATURE_POS_X_FUDGE = -10;
const FEATURE_POS_Y_FUDGE = 15;

// References and state
let mouthState = CLOSED_STATE;
let curMouthToothEl;
let curFreeToothEl;
let destMouthState;


const data = {
	incisor: {
	  value: 'incisor',
    freeToothEl: document.getElementById('incisor'),
    radioBtnId: 'tooth-set_incisor',
    name: 'Incisor',
    description: 'The sharp one.'
	},
	canine: {
	  value: 'canine',
    freeToothEl: document.getElementById('canine'),
    radioBtnId: 'tooth-set_canine',
    name: 'Canine',
    description: 'The sturdy one.'
  },
	premolar: {
  	value: 'premolar',
    freeToothEl: document.getElementById('premolar'),
    radioBtnId: 'tooth-set_premolar',
    name: 'Premolar',
    description: 'The warm up.'
  },
  molar: {
  	value: 'molar',
    freeToothEl: document.getElementById('molar'),
    radioBtnId: 'tooth-set_molar',
    name: 'Molar',
    description: 'The strong one.'
  }
}


const selectorEl = document.getElementById('tooth-selector_radio');
const mouthEl = document.getElementById('mouth-anims');
const mouthCtrl = mouthEl ? mouthEl.svgatorPlayer : {};
const toothPlacementEl = document.getElementById('tooth-placement');


mouthCtrl.play();

// Handle changes via radio buttons (including tabbing)
///////////////////////////////////////////////////////

selectorEl.addEventListener('change', (event) => {
  let selectedBtnEl = event.target;
  
  if(curFreeToothEl) animateToothOff(curFreeToothEl);
  curFreeToothEl = showTooth( document.getElementById(selectedBtnEl.value) );
  
  updateTextContent(selectedBtnEl.value);
});


// Handle changes via SVG interaction
/////////////////////////////////////

mouthEl.addEventListener('mouseenter', openMouth );
mouthEl.addEventListener('mouseleave', closeMouth );

// Constantly key tabs on what frame the animation should be going to
mouthCtrl.on('keyframe', updateAnimState);


setToothActions({
	...data.incisor,
 	mouthToothEl: document.getElementById('mouth-anims-u-incisor-r'),
});
setToothActions({
	...data.incisor,
	mouthToothEl: document.getElementById('mouth-anims-u-incisor-l'),
});
setToothActions({
	...data.canine,
	mouthToothEl: document.getElementById('mouth-anims-u-canine-r'),
});
setToothActions({
	...data.canine,
	mouthToothEl: document.getElementById('mouth-anims-u-canine-l'),
});
setToothActions({
	...data.premolar,
	mouthToothEl: document.getElementById('mouth-anims-u-premolar-r'),
});
setToothActions({
	...data.premolar,
	mouthToothEl: document.getElementById('mouth-anims-u-premolar-l'),
});
setToothActions({
	...data.molar,
	mouthToothEl: document.getElementById('mouth-anims-u-molar-r'),
});
setToothActions({
	...data.molar,
	mouthToothEl: document.getElementById('mouth-anims-u-molar-l'),
});


function updateTextContent(value) {
	document.getElementById('heading').innerHTML = data[value].name;
  document.getElementById('description').innerHTML = data[value].description;
}

function setToothActions(options) {
	const toothEl = options.mouthToothEl;
	toothEl.addEventListener('mouseenter', () => highlight(toothEl) );
	toothEl.addEventListener('mousedown', () => selectTooth(options) );
}

function highlight(toothEl) {
	const curRot = gsap.getProperty(toothEl, 'rotation');
  // Note, the rotation can incrementally over successive highlights, but I like it
	gsap.set(toothEl, { transformOrigin: '50% 50%' });
	let tl = new gsap.timeline();
	tl.to(toothEl, { rotation: curRot + 5, duration: 0.1 });
  tl.to(toothEl, { rotation: curRot - 2, duration: 0.1 });
  tl.to(toothEl, { rotation: curRot, duration: 0.1 });
}

function selectTooth({value, mouthToothEl, freeToothEl, radioBtnId}) {

	// Check radio button
	document.getElementById(radioBtnId).checked = true;
  
  // Change text content
  updateTextContent(value);
  
  // Animate previously selected tooth
  if(curFreeToothEl) animateToothOff(curFreeToothEl, curMouthToothEl);
  
  // Animate newly selected tooth 
  curFreeToothEl = animatePullingTooth(mouthToothEl, freeToothEl);
  curMouthToothEl = mouthToothEl;
}


function openMouth() {
	if(mouthState == OPEN_STATE) return;
	destMouthState = OPEN_STATE;
  gsap.killTweensOf(mouthEl);
  gsap.to(mouthEl, {
  	scale: '2.1',
    duration: 1.5,
    ease: "elastic.out(1, 0.3)"
  })
  updateAnimState();
}

function closeMouth() {
	if(mouthState == CLOSED_STATE) return;
  destMouthState = CLOSED_STATE;
	gsap.killTweensOf(mouthEl);
  gsap.to(mouthEl, {
  	scale: '1'
  })
  updateAnimState();
}


// This still confuses me. What a mess.
function updateAnimState(currentTime) {
    
	if(destMouthState == OPEN_STATE) {
  
  	if(currentTime < OPEN_LOOPSTART) {
    	mouthCtrl.play(); // Just keep playing until it gets there
			mouthState = OPENING_STATE;
      mouthEl.classList.add('active');
    } else if(currentTime >= OPEN_LOOPEND) {
    	mouthCtrl.seekTo(OPEN_LOOPSTART);
      mouthCtrl.play();
			mouthState = OPEN_STATE;
    } else if(currentTime > CLOSE_START) {
    	mouthCtrl.play(); // Finish closing first
			mouthState = CLOSING_STATE;
    } else if(currentTime >= CLOSE_END) {
    	mouthCtrl.seekTo(OPEN_START);
			mouthCtrl.play();
			mouthState = CLOSED_STATE;
      mouthEl.classList.remove('active');

    } else {
    	mouthCtrl.play();
			mouthState = OPENING_STATE;
    }
  
  } else if(destMouthState == CLOSED_STATE & mouthState != CLOSED_STATE) {
        
  	if(currentTime < CLOSE_END) {
	    mouthState = CLOSING_STATE;
    	mouthCtrl.play();
    }
  
  } else {
  	// It's closed
		mouthEl.classList.remove('active');
  }

}


function animatePullingTooth(sourceEl, freeToothEl) {

	const	animEl = freeToothEl.cloneNode(true);
  document.body.append(animEl);

	// get tooth's position in mouth
  const posInMouth = getAbsPosition(sourceEl);
  const posAsFeature = getAbsPosition(toothPlacementEl);
  
  gsap.set(sourceEl, {
  	opacity: 0,
    pointerEvents: 'none'
  });
  gsap.set(animEl, { opacity: 1 });
    
  gsap.fromTo(animEl, {
  	x: posInMouth.x + MOUTH_POS_X_FUDGE,
  }, {
  	x: posAsFeature.x + FEATURE_POS_X_FUDGE,
    duration: 1.2,
    ease: "power2.inOut"
  })
  
  const sourceRot = gsap.getProperty(sourceEl, 'rotation') + 180;	// Note sure why it's 180
  gsap.fromTo(animEl, {
    y: posInMouth.y + MOUTH_POS_Y_FUDGE,
  }, {
    y: posAsFeature.y + FEATURE_POS_Y_FUDGE,
    duration: 2,
    ease: "elastic.out(2, 0.75)"
	})
      
	gsap.fromTo(animEl, {
    rotation: sourceRot,
    scale: 2,
  }, {
    rotation: 250 + Math.random()*20 ,
    scale: 3,
    duration: 2.5,
    ease: "elastic.out(1, 1)"
  })
  gsap.set(animEl, {
	  delay: 0.5,
    zIndex: -10,
  })
  
  return animEl;
}


function getAbsPosition(el) {
  let elRect = el.getBoundingClientRect();
  let x = elRect.left + (elRect.right-elRect.left)/2
  let y = elRect.top + (elRect.bottom-elRect.top)/2;
  
  return {x,y};
}


function showTooth(toothEl) {
  const	animEl = toothEl.cloneNode(true);
  document.body.append(animEl);

  const posAsFeature = getAbsPosition(toothPlacementEl);
  
  gsap.set(animEl, {
  	zIndex: -10,
    x: posAsFeature.x + FEATURE_POS_X_FUDGE
  })
  
  gsap.to(animEl, {
	  delay: 0.2,
    opacity: 1,
    duration: 0.5,
	})
  
  gsap.fromTo(animEl, {
    y: posAsFeature.y - 50,
  }, {
  	delay: 0.2,
    y: posAsFeature.y + FEATURE_POS_Y_FUDGE,
    duration: 1,
    ease: "elastic.out(2, 0.75)"
	})
      
	gsap.fromTo(animEl, {
    rotation: 230 + Math.random()*60,
    scale: 2,
  }, {
  	delay: 0.2,
    rotation: 250 + Math.random()*20 ,
    scale: 3,
    duration: 1,
    ease: "elastic.out(1, 1)"
  })
  
  return animEl;
}


function animateToothOff(freeToothEl, mouthToothEl) {
 
  gsap.to(freeToothEl, {
    y: '+=1000',
    duration: 0.5,
    ease: "power3.in",
  })
  gsap.to(freeToothEl, {
    rotation: 240 + Math.random()*40,
    scale: 2.5,
    duration: 0.5,
    ease: "power3.in",
    onComplete: () => {
      freeToothEl.parentNode.removeChild(freeToothEl);
      if(mouthToothEl) growNewTooth(mouthToothEl);
    },
  })
  
}

function growNewTooth(mouthToothEl) {
	const destScale = gsap.getProperty(mouthToothEl, 'scale');
  gsap.fromTo(mouthToothEl, {
    scale: 0
  }, {
    delay: 4,
    onStart: () => {
      gsap.set(mouthToothEl, {
        opacity: 1,
        pointerEvents: 'auto'
      });
    },
    duration: 1,
    scale: destScale,
    ease: "circ.inOut"
  });
}
