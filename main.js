import fetch from "node-fetch";

const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImU1MTQ1MmExOGE4NmM3NjE5NjE5ZTFkZTZmYTNhZjY1M2U0ZjNhMTQ5MGIwMDRiNTkxYTQ1MTc1MGFkYzIzMjNhOTY1NDFmYjMyMWNhNTExIn0.eyJhdWQiOiIwMWI3MjZlMy01OTIyLTQ2YzEtOTk1Mi1iZmFhZTQzNGZiNzkiLCJqdGkiOiJlNTE0NTJhMThhODZjNzYxOTYxOWUxZGU2ZmEzYWY2NTNlNGYzYTE0OTBiMDA0YjU5MWE0NTE3NTBhZGMyMzIzYTk2NTQxZmIzMjFjYTUxMSIsImlhdCI6MTY2MDE5OTE3OSwibmJmIjoxNjYwMTk5MTc5LCJleHAiOjE2NjAyODU1NzksInN1YiI6Ijg0MzgzODAiLCJhY2NvdW50X2lkIjozMDMyMjIwNywic2NvcGVzIjpbInB1c2hfbm90aWZpY2F0aW9ucyIsImZpbGVzIiwiY3JtIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyJdfQ.O1Mzj7Ijfiu5jOCJk_eDVuqr4HuyjEtTyz7pUrjUmyitRvOToN8Hc_ldL0aWYSDE_F2hJj56OcPFQC2NAAAMSUHEzHeELbHcAmWY4NLzkzkdOmFvLrVXNmq-gF30ffgWmntMiOv4FwJo_qJzZH3otH_XCwWEvK3hRSPpIFYUMBppN_5rc63W7Wg4pav-TTKoRprB95MUte-8lTUiCucrqRfkYQtlJjxDvQsN6nqM1_RNq7UukZjdEnD6N9ksnxpVMrf_77gxXfrKJoHCbMvcbWWu0HaF30a1LeBtvkJJ6L3Q4TMm7h-joICu1wfYNZebuKVYDn3iP1Jv1ab8XcCsDg';
const refresToken = 'def50200150c912e97e155506083fc39c3e612d4fb5b6ac70bd05b446fec7f1c6088571395ce99ff46838266f88ae88a41331f56b512f6a828d5e045697472376991e26915027b9e574991948720145b34ddefac6f9517b415bc0a4bd0f2cfce3f087041133e7bdcccc7a16796f79f1234b72baea2752e7a3f265c5f8588d3850085acbd959bf60e678519d4223ac29500bbc3960aba7a657c054589fe2b924d6a2320b5dfd2a1316b4274b1d6f08a66f1cb263171a4586b08e7053c1991d9fe9ece8530e2aca9948b9dac476926cf8d68acec57225d96b4e459c304821bce7f95c0d430e8012ee0588ffe449fa26428e40ba385011b46f33ad77693173811ad688f0f2f251f45f6a78a592f67c4b6d131bffff5eb00432a464105f6e6005669b0ed2b37e9ba246a20a5e9d1dc4aa6d4aac20f218dcc360b821b7c234e634eae9f3b6fe5ed9b85a51881a36b0f21db35073e5895259c0777f342f8ea0969bb5dd765a683e685923b13e39ea5e1c7d23b9c15610333c52c8da91d87b9ed428514cba9a3704591f419e98c6849c4ca40ddeab0b4073119855121fb473806afbbe780d6d3d6b6bdd3ef4a3b47cf273b70847982fb5be475331170e27b90a347c5ef97f50780d429b2908ca8bbb9f3b2d43a7e2eb5f7253f0c10f00d';
const baseAccountUrl = 'https://natalyaponomarenko94.amocrm.ru/';

start();

async function start() {
    const contacts = await getContacts();
    const deals = await getDeals();
    const companiesWithDeals = new Set(deals.map((deal) => deal._embedded.companies.map((company) => company.id)).flat());
    const contactsWithoutDeals = contacts.filter((contact) => contact._embedded.companies.some((company) => !companiesWithDeals.has(company.id)));
    for await (const contact of contactsWithoutDeals) {
        await createTaskForNewDeal(contact.name);
    }
}



async function getContacts() {
    try {
        const response = await fetch(baseAccountUrl + 'api/v4/contacts', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data._embedded.contacts;
        } else {
            console.error('Error occured while getting contacts: ' + response.status);
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getDeals() {
    try {
        const response = await fetch(baseAccountUrl + 'api/v4/leads', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data._embedded.leads;
        } else {
            console.error('Error occured while getting contacts: ' + response.status);
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function createTaskForNewDeal(name) {
    try {
        const unixDateNow = Math.floor(Date.now() / 1000);
        const unixTomorrowTimestamp = 60 * 60 * 24;
        const body = [{
            text: `Организовать сделку с ${name}`,
            complete_till: unixDateNow + unixTomorrowTimestamp,
        }];
        await fetch(baseAccountUrl + '/api/v4/tasks', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            method: 'post',
        });
    } catch (error) {
        console.error(error);
    }
}