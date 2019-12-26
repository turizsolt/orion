export async function apiFetchUser() {
    const result = await fetch('http://api.condorcet.zsiri.eu/election/1/');
    const data = await result.json();

    return data.options.map((elem: string, idx: number) => ({
        id: idx,
        name: elem,
    }));
}

export async function apiSubmit(arr: any) {
    await fetch('http://api.condorcet.zsiri.eu/election/1/vote', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(arr),
    });
}
