export const debounce = <Fn extends (...args: any[]) => Promise<R>, R = void>(inner: Fn, ms: number) => {
    let timer: NodeJS.Timeout;
    let resolves: ((r: R) => void)[] = [];

    return ((...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            let result = await inner(...args);
            resolves.forEach(r => r(result));
            resolves = [];
        }, ms);

        return new Promise<R>(r => resolves.push(r));
    }) as Fn
}
