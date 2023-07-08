function rand(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function score() {
	let currentScore = $("ul").data('score')
	$('li').each( function(i, e) {
		if (i < currentScore) {
			setTimeout(() => {
				e.classList.remove('off')
				spark(e, 5*i, i*50, i*20)
			}, i*50)
		} else {
			e.classList.add('off')
		}
	})
}

function setScore(s) {
	if ($("ul").data('score') == s) {
		$("ul").data('score', 0)
	} else {
		$("ul").data('score', s)
	}
	score()
}

function spark(e, nbStars, amp = 50, delay = 200) {
	const possibleStars = ["✨", "⭐", "🌟", "💫"]
	
		for (let i = 0; i < nbStars; i++) {
		let s = document.createElement('span');
		s.textContent = possibleStars[rand(0,possibleStars.length-1)];
		s.style.setProperty('--t', rand(-amp, amp) + "%");
		s.style.setProperty('--l', rand(-amp, amp) + "%");
		s.style.setProperty('--d', rand(0, delay) + "ms");
		e.append(s);
		setTimeout(() => { s.remove() }, 3000);
	}
}

$("li").on( "mouseenter", function() {
	spark($(this), 2)
})

score()