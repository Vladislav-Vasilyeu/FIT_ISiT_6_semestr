const mystr = "Где используется автожир";
		let words = mystr.split(" ");
		const knoleage = [
				["автожир","является","летательным аппаратом"],
				["автожир", "имеет", "толкающий или тянущий воздушный винт для создания тяги"],
				["автожир", "используется", "в рекреационной авиации и аэросъемке"]
				 ];
		const endings = [
				["ет", "(ет|ут|ют)"],
				["ут", "(ет|ут|ют)"],
				["ют", "(ет|ут|ют)"],
				["ется", "(ется|утся|ются)"]
				];		

		function getEnding(word)
		{
			for (let j = 0; j < endings.length; j++)
			{
				if(word.substring(word.length-endings[j][0].length) == endings[j][0]) return j;
			}
			return -1;
		}
		let predicate = -1;
		console.log(words);
		for (let word of words)
		{
			if(getEnding(word) >= 0)
			{
			predicate = words.indexOf(word);
			}

		}
		console.log(words[predicate])