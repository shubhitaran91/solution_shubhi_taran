const fs = require('fs');
const clicks = require('./clicks.json');

const getOccurenceOfClicksPerIp = () => {
    var clickOccurencePerIP = {}
    for ( click of clicks ) {
        if(clickOccurencePerIP[click.ip]) {
            clickOccurencePerIP[click.ip]++;
        } else {
            clickOccurencePerIP[click.ip] = 1;
        }
    }
    return clickOccurencePerIP;
} 
  
  
const calculateIfHourBetweenClick = (i, resultSet) => {
    var withInHourPeriod;
    var prevDate;
    var presentDate = new Date(resultSet[i].timestamp).getHours();
    if (resultSet.length < 2) {
        return true;
    } else { 
        prevDate = new Date(resultSet[i-1].timestamp).getHours();
        withInHourPeriod = presentDate - prevDate;
        return withInHourPeriod === 0;
    }
}
  
const checkIfOverHourPeriod = (withInHourPeriod, resultSet, index) => {
    if(withInHourPeriod && resultSet.length > 1) {
        return checkForExpensiveClicks(index, resultSet);
    } else {
        return resultSet;
    }
}

const checkForDeplicateIPsAndAmounts = (click, nextResultSet, currentResultSet) => {
    var duplicate = currentResultSet.find(clickItem => {
        return clickItem.ip === click.ip && clickItem.amount === click.amount
    });
    if(duplicate) {
        return currentResultSet;
    } else {
        return nextResultSet;
    }
}
  
  
const checkForExpensiveClicks = (index, resultSet) => {
    var newResultSet;
    var presentClick = resultSet[index];
    var prevClick = resultSet[index-1];
    var presentClickAmount = presentClick.amount;
    var prevClickAmount = prevClick.amount;

    if(presentClickAmount > prevClickAmount) {
        newResultSet = resultSet.slice(0, resultSet.length - 2);
        return [...newResultSet, resultSet[index]];
    } else if (presentClickAmount < prevClickAmount){
        newResultSet = resultSet.slice(0, resultSet.length - 1);
        return newResultSet;
    } else {
        newResultSet = resultSet.slice(0, resultSet.length - 1);
        return checkForDeplicateIPsAndAmounts(presentClick, resultSet, newResultSet);
    } 
}

const createResultSet = () => {
    var index; 
    var calculatedHour;
    var clickOccurencePerIP = getOccurenceOfClicksPerIp();
    var result = clicks.reduce((acc, click) => {
        
        if (clickOccurencePerIP[click.ip] < 11) {
            acc.push({
                ip: click.ip,
                timestamp: click.timestamp,
                amount: click.amount,
            });
            index = acc.length -1;
            calculatedHour = calculateIfHourBetweenClick(index, acc);
            acc = checkIfOverHourPeriod(calculatedHour, acc, index);
        
            return acc;
        } else {
            return acc;
        }
      }, []);
    
      result = JSON.stringify(result, null, "\t");

    fs.writeFile("resultset.json", result, function(err, result) {
        if(err) console.log('error', err);
    });
}

createResultSet();
    
module.exports = { 
    getOccurenceOfClicksPerIp,
    calculateIfHourBetweenClick,
    checkIfOverHourPeriod,
    checkForExpensiveClicks,
    checkForDeplicateIPsAndAmounts,
    createResultSet
};



