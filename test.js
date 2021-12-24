const main = require('./index');


describe('when getOccurenceOfClicksPerIp is called', ()=> {
    let getOccurenceOfClicksPerIp;
    let clicks = [
        { "ip":"22.22.22.22", "timestamp":"3/11/2016 02:02:58", "amount": 7.00 },
        { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:02:54", "amount": 15.75 },
        { "ip":"66.66.66.66", "timestamp":"3/11/2016 07:02:54", "amount": 14.25 },
        { "ip":"55.55.55.55", "timestamp":"3/11/2016 14:02:54", "amount": 4.25 },
        { "ip":"55.55.55.55", "timestamp":"3/11/2016 14:03:04", "amount": 5.25 },
        { "ip":"22.22.22.22", "timestamp":"3/11/2016 23:59:59", "amount": 9.00 }
    ]
    beforeEach(() => {
        getOccurenceOfClicksPerIp = jest.fn().mockImplementation(() => {
            var clickOccurencePerIP = {}
            for ( click of clicks ) {
                if(clickOccurencePerIP[click.ip]) {
                    clickOccurencePerIP[click.ip]++;
                } else {
                    clickOccurencePerIP[click.ip] = 1;
                }
            }
            return clickOccurencePerIP;
        });
    });
    it('will count the occurrence of each ip individually', () => {
        expect(getOccurenceOfClicksPerIp()).toEqual({
            '22.22.22.22': 2,
            '33.33.33.33': 1,
            '55.55.55.55': 2,
            '66.66.66.66': 1,
        });
    });
});

describe('when calculateIfHourBetweenClick is called', () => {
    let clicks;
    let index;
    it('will check in a data set where the hour period is different', () => {
        clicks = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 02:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:02:54", "amount": 15.75 },
        ];
        index = clicks.length - 1;
        expect(main.calculateIfHourBetweenClick(index, clicks)).toEqual(false);
    });
    it('will check in a data set where the hour period is the same', () => {
        clicks = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:09:54", "amount": 15.75 },
        ];
        index = clicks.length - 1;
        expect(main.calculateIfHourBetweenClick(index, clicks)).toEqual(true);
    });
    it('will check in a data set where there is only one element', () => {
        clicks = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 02:02:58", "amount": 7.00 },
        ];
        index = clicks.length - 1;
        expect(main.calculateIfHourBetweenClick(index, clicks)).toEqual(true);
    });
});

describe('when checkIfOverHourPeriod is called', () => {
    let clicks;
    let index;
    let withInHourPeriod;
    it('has the last 2 items in the result set in the same hour period', () => {
        clicks = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:09:54", "amount": 15.75 },
        ];
        index = clicks.length - 1;
        withInHourPeriod = main.calculateIfHourBetweenClick(index, clicks);
        expect(main.checkIfOverHourPeriod(withInHourPeriod, clicks, index)).toEqual([{ 
            ip: '33.33.33.33',
            timestamp: '3/11/2016 07:09:54',
            amount: 15.75
        }]);
    });
    it('has the last 2 items in the result set in different hour period', () => {
        clicks = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 02:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:02:54", "amount": 15.75 },
        ];
        index = clicks.length - 1;
        withInHourPeriod = main.calculateIfHourBetweenClick(index, clicks);
        expect(main.checkIfOverHourPeriod(withInHourPeriod, clicks, index)).toEqual(clicks);
    });
    it('has the last 1 item in the result set', () => {
        clicks = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 02:02:58", "amount": 7.00 }
        ];
        index = clicks.length - 1;
        withInHourPeriod = main.calculateIfHourBetweenClick(index, clicks);
        expect(main.checkIfOverHourPeriod(withInHourPeriod, clicks, index)).toEqual(clicks);
    });
});

describe('when checkForDeplicateIPsAndAmounts is called', () => {
    let click;
    let nextResultSet;
    let currentResultSet;
    it('will have a duplicate IP in the set', () => {
        nextResultSet = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:03:54", "amount": 7.00 },
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:04:54", "amount": 7.00 },
        ]
        currentResultSet = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:03:54", "amount": 7.00 },
        ];
        click = { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:04:54", "amount": 7.00 };
        expect(main.checkForDeplicateIPsAndAmounts(click, nextResultSet, currentResultSet)).toEqual(currentResultSet);
    });
    it('will not have duplicate IP in the set', () => {
        nextResultSet = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:03:54", "amount": 7.00 },
        ]
        currentResultSet = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 7.00 }
        ]
        click = { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:03:54", "amount": 7.00 };
        expect(main.checkForDeplicateIPsAndAmounts(click, nextResultSet, currentResultSet)).toEqual(nextResultSet);
    });
});

describe('when checkForExpensiveClicks is called', () => {
    let index;
    let resultSet;
    it('has the click amount at the end of the set greater than the click before', () => {
        resultSet = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:03:54", "amount": 10.00 },
        ];
        index = resultSet.length -1;
        expect(main.checkForExpensiveClicks(index, resultSet)).toEqual([resultSet[1]]);
    });
    it('has the click amount at the end of the set less than the click before', () => {
        resultSet = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 10.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:03:54", "amount": 7.00 },
        ];
        index = resultSet.length -1;
        expect(main.checkForExpensiveClicks(index, resultSet)).toEqual([resultSet[0]]);
    });
    it('has the click amount at the end of the set equal to the click before', () => {
        resultSet = [
            { "ip":"22.22.22.22", "timestamp":"3/11/2016 07:02:58", "amount": 7.00 },
            { "ip":"33.33.33.33", "timestamp":"3/11/2016 07:03:54", "amount": 7.00 },
        ];
        index = resultSet.length -1;
        expect(main.checkForExpensiveClicks(index, resultSet)).toEqual(resultSet);

    });
});