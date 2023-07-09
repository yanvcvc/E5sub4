function countWords(str) {
  var words = str.split(' ');
  var wordCount = {};

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    if (wordCount[word]) {
      wordCount[word]++;
    } else {
      wordCount[word] = 1;
    }
  }

  return wordCount;
}

console.log(countWords("I am learning JavaScript and JavaScript is fun")); 
// 输出：{ I: 1, am: 1, learning: 1, JavaScript: 2, and: 1, is: 1, fun: 1 }
