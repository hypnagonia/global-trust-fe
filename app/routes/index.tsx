import { LoaderArgs } from '@remix-run/node'
import {
	Form,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import {
	globalRankByHandle,
	globalRankings,
	PER_PAGE,
	rankingCounts,
	strategies,
	Strategy,
} from '~/api/api'
import LoadingIndicator from '~/components/LoadingIndicator'
import Pagination from '~/components/Pagination'
import { explorerNFTURL } from '~/utils'
import { getContractMeta } from '~/api/meta'

const DEFAULT_STRATEGY = '6'

export const loader = async ({ request }: LoaderArgs) => {
	const url = new URL(request.url)
	const strategy = url.searchParams.get('strategy') || DEFAULT_STRATEGY
	let page = url.searchParams.get('page')
		? Number(url.searchParams.get('page'))
		: 1

	const [results, count] = await Promise.all([
		globalRankings(strategy, page),
		rankingCounts(strategy),
	])

	return {
		results: results || [],
		page,
		strategy,
		count
	}
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [contractsMeta, setContractState] = useState({})

	useEffect(() => {
		const run = async () => {

			const contracts = data.results
			if (!contracts.length) {
				return
			}

			// const res = await getContractMeta(contracts[0].address)
			// one by one to spare api
			const acc = {}
			for (const contract of contracts) {
				try {
					const res = await getContractMeta(contract.address)
					// @ts-ignore
					acc[contract.address] = res
				} catch (e) { }

			}
			setContractState({...contractsMeta, ...acc})

		}

		run()
	}, [data.results])

	return (
		<main>
			<LoadingIndicator />

			<a href="https://k3l.io" target="_blank">
				<img
					width="180px"
					className="logo"
					src="/logo.svg"
					draggable="false"
					alt="Karma3Labs Logo"
				/>
			</a>

			<div className="container">
				<header>
					<div className="title">
						<h1>Global Trust Rankings</h1>
						<p>
							<small>
								Rankings based on EigenTrust algorithm.
							</small>
						</p>
					</div>

					<div className="strategies">
						{strategies.map((strategy: Strategy) => {
							const sp = new URLSearchParams(
								searchParams.toString(),
							)
							sp.set('strategy', strategy.id)

							return (
								<button
									className="btn tooltip"
									style={
										strategy.id === data.strategy
											? {
												backgroundColor:
													'var(--c-naples-yellow)',
											}
											: undefined
									}
									key={strategy.id}
									onClick={() =>
										navigate(`?${sp.toString()}`)
									}
								>
									{strategy.name}
									<span className="tooltiptext">
										{strategy.description}
									</span>
								</button>
							)
						})}
					</div>

					<Form method="get" className="search">
						<input
							type="text"
							name="handle"
							placeholder="Search by profile handle"
						/>
						<input
							type="hidden"
							name="strategy"
							value={data.strategy}
						/>

						<button className="btn" type="submit">
							Search
						</button>


					</Form>
				</header>

				<div className="profiles-grid">
					<div>
						<strong>Score</strong>
						<strong></strong>
						<strong>NFT Collection</strong>

					</div>
					{data.results.map((p) => (
						<div
							key={p.address}
						>
							<span>{p.score + 1}</span>
							<span>
							
								{
									//@ts-ignore
								contractsMeta[p.address] && <>
									<img
										style={{ width: 30 }}
										//@ts-ignore
										src={contractsMeta[p.address].image as string} />
								</>}
							</span>

							<span>
								<a href={explorerNFTURL(p.address)} target="_blank" rel="noopener noreferrer">
									{p.name} {p.symbol}
								</a>
							</span>


						</div>
					))}
					{data.results.length === 0 && <div>No results</div>}
				</div>

				<Pagination
					numberOfPages={Math.ceil(data.count / PER_PAGE)}
					currentPage={data.page}
				/>
			</div>
		</main>
	)
}

export function ErrorBoundary({ error }: { error: Error }) {
	return (
		<main>
			<div className="container">
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>
			</div>
		</main>
	)
}
